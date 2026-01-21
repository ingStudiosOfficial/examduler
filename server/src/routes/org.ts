import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { validateCreateOrgSchema, validateUpdateOrgSchema } from '../middleware/validate_schema.js';
import type { ICreateOrg, IOrg, IUpdateOrg } from '../interfaces/Org.js';
import { createVerificationToken, verifyDomainTxt, verifyDomainHttp, parseOrgMembers, checkValidDomain, addDomainPrefix, getNewMembers } from '../utils/org_utils.js';
import type { IDomain } from '../interfaces/Domain.js';
import { getDomain, verifyUsers } from '../utils/user_utils.js';
import type { IMemberWithEmail, IStoredMember } from '../interfaces/Member.js';
import type { IUser } from '../interfaces/User.js';

export const orgRouter = Router();

orgRouter.post('/create/', authenticateToken(), verifyRole('admin'), validateCreateOrgSchema, async (req: Request, res: Response) => {
    const orgFromBody: ICreateOrg = req.body;

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID missing or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const orgId = new ObjectId();

        const adminId = new ObjectId(req.user.id);

        const admin = await req.db.collection<IUser>('users').findOne({ _id: adminId });

        if (!admin) {
            return res.status(403).json({
                message: 'User is forbidden from creating the organization.',
            });
        }

        const { members, ...tempOrg } = orgFromBody;

        let parsedMembers: IStoredMember[];

        try {
            parsedMembers = await parseOrgMembers(members, req.db, [], orgId, adminId, admin.email);
        } catch (error) {
            return res.status(400).json({
                message: 'Failed to parse members. Members are in an invalid format.',
            });
        }


        const orgToCreate: IOrg = { ...tempOrg, members: parsedMembers, _id: orgId };

        for (const [index, domain] of orgToCreate.domains.entries()) {
            if (!orgToCreate.domains[index]) {
                console.error('Domain object missing.');
                return res.status(400).json({
                    message: 'Domain object missing.',
                });
            }
            
            orgToCreate.domains[index].domain = addDomainPrefix(domain.domain);

            if (!checkValidDomain(domain.domain)) {
                return res.status(400).json({
                    message: `Domain '${domain.domain}' is invalid.`,
                });
            }

            console.log('Converted domain string to IDomain:', orgToCreate.domains[index]);

            const verificationToken = createVerificationToken();
            console.log('Verification token:', verificationToken);
            orgToCreate.domains[index].verificationToken = verificationToken;
        }

        const conflict = await req.db.collection<IOrg>('organizations').findOne({
            domains: {
                $elemMatch: {
                    domain: { $in: orgToCreate.domains.map(d => d.domain) },
                    verified: true
                }
            }
        });

        if (conflict) {
            const matchedDomain = conflict.domains.find(d => 
                orgToCreate.domains.map(d => d.domain).includes(d.domain) && d.verified
            )?.domain;

            return res.status(409).json({
                message: `Organization with domain '${matchedDomain}' already exists.`,
            });
        }

        const result = await req.db.collection<IOrg>('organizations').insertOne(orgToCreate);

        if (!result.insertedId) {
            console.error('Failed to insert organization.');
            return res.status(500).json({
                message: 'An internal server error occurred while inserting exam',
            });
        }

        console.log('Successfully created organization.');
        return res.status(200).json({
            message: 'Successfully created organization.',
        });
    } catch (error) {
        console.error('An error occurred while creating organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while creating the organization.',
        });
    }
});

orgRouter.post('/verify/txt/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.body.id || !req.body.domain || !checkValidDomain(req.body.domain)) {
        return res.status(400).json({
            message: 'Organization ID or domain is missing.',
        });
    }

    if (!ObjectId.isValid(req.body.id)) {
        return res.status(400).json({
            message: 'Organization ID invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.body.id);
        const domainToVerify = req.body.domain;

        const organization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        if (!organization.domains || organization.domains.length === 0) {
            return res.status(404).json({
                message: 'Organization has no domains registered for verification.',
            });
        }

        const fetchedDomain = organization.domains.find((matchedDomain: IDomain) => matchedDomain.domain === domainToVerify);

        if (!fetchedDomain) {
            console.error('Domain to verify not linked to organization.');
            return res.status(403).json({
                message: 'Domain to verify not linked to organization.',
            });
        }

        const existingVerifiedOrg = await req.db.collection<IOrg>('organizations').findOne({
            domains: {
                $elemMatch: {
                    domain: fetchedDomain.domain,
                    verified: true
                }
            }
        });

        if (existingVerifiedOrg) {
            return res.status(409).json({
                message: `Organization with domain ${fetchedDomain.domain} already exists and is verified.`,
            });
        }

        const { success, status, message } = await verifyDomainTxt(domainToVerify, fetchedDomain.verificationToken);

        if (!success) {
            console.error('Could not verify domain:', message);
            return res.status(status).json({
                message: message,
            });
        }

        const updatedResult = await req.db.collection<IOrg>('organizations').updateOne({ _id: orgId, 'domains.domain': domainToVerify }, { $set: { 'domains.$.verified': true } });

        if (updatedResult.matchedCount === 0) {
            console.error('Could not find organization.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id), domainToVerify);
        
        console.log('Successfully verified domain.');
        
        return res.status(200).json({
            message: 'Successfully verified domain.',
        });
    } catch (error) {
        console.error('Failed to verify domain:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while verifying domain.',
        });
    }
});

orgRouter.post('/verify/http/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.body.id || !req.body.domain || !checkValidDomain(req.body.domain)) {
        return res.status(400).json({
            message: 'Organization ID or domain is missing.',
        });
    }

    if (!ObjectId.isValid(req.body.id)) {
        return res.status(400).json({
            message: 'Organization ID invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.body.id);
        const domainToVerify = req.body.domain;

        const organization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!organization) {
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        if (!organization.domains || organization.domains.length === 0) {
            return res.status(404).json({
                message: 'Organization has no domains registered for verification.',
            });
        }

        const fetchedDomain = organization.domains.find((matchedDomain: IDomain) => matchedDomain.domain === domainToVerify);

        if (!fetchedDomain) {
            console.error('Domain to verify not linked to organization.');
            return res.status(403).json({
                message: 'Domain to verify not linked to organization.',
            });
        }

        const existingVerifiedOrg = await req.db.collection<IOrg>('organizations').findOne({
            domains: {
                $elemMatch: {
                    domain: fetchedDomain.domain,
                    verified: true
                }
            }
        });

        if (existingVerifiedOrg) {
            return res.status(409).json({
                message: `Organization with domain ${fetchedDomain.domain} already exists and is verified.`,
            });
        }

        const { success, status, message } = await verifyDomainHttp(domainToVerify, fetchedDomain.verificationToken);

        if (!success) {
            console.error('Could not verify domain:', message);
            return res.status(status).json({
                message: message,
            });
        }

        const updatedResult = await req.db.collection<IOrg>('organizations').updateOne({ _id: orgId, 'domains.domain': domainToVerify }, { $set: { 'domains.$.verified': true } });

        if (updatedResult.matchedCount === 0) {
            console.error('Could not find organization.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id), domainToVerify);

        console.log('Successfully verified domain.');
        
        return res.status(200).json({
            message: 'Successfully verified domain.',
        });
    } catch (error) {
        console.error('Failed to verify domain:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while verifying domain.',
        });
    }
});

orgRouter.get('/fetch/:id/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.params?.id || !ObjectId.isValid(req.params?.id)) {
        console.error('Organization ID missing or invalid.');
        return res.status(400).json({
            message: 'Organization ID missing or invalid.',
        });
    }

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.params.id);

        const fetchedOrganization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!fetchedOrganization) {
            console.error('Organization not found.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        if (!fetchedOrganization.members.map(m => m._id).includes(new ObjectId(req.user.id))) {
            return res.status(403).json({
                message: 'User is forbidden from updating the organization.',
            });
        }

        return res.status(200).json({
            message: 'Organization fetched successfully.',
            organization: fetchedOrganization,
        });
    } catch (error) {
        console.error('Error while fetching organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while fetching the organization.',
        });
    }
});

/*
FOR THIS ROUTE:
~ 1. Verify whether user can edit organization
~2. Compare members to keep vs original org
~3. Delete members that are NOT part of the organization
4. Parse members again
5. DO NOT recreate verification token and keep verification status for existing domains the same
6. Add NEW domains (unverified) to the organization
7. Compare diff and update
*/

orgRouter.patch('/update/:id/', authenticateToken(), verifyRole('admin'), validateUpdateOrgSchema, async (req: Request, res: Response) => {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        console.error('Organization ID missing or invalid.');
        return res.status(400).json({
            message: 'Organization ID missing or invalid.',
        });
    }

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID missing or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const adminId = new ObjectId(req.user.id);
        const orgId = new ObjectId(req.params.id);
        const orgBody: IUpdateOrg = req.body;

        const adminUser = await req.db.collection<IUser>('users').findOne({ _id: adminId });

        if (!adminUser) {
            console.error('Admin not found.');
            return res.status(404).json({
                message: 'Admin not found.',
            });
        }

        const organization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!organization) {
            console.error('Organization to update not found.');
            return res.status(404).json({
                message: 'Organization to update not found.',
            });
        }

        // Verify whether user can edit organization
        const adminAuthorized = organization.members.filter(m => m.verified).map(m => m._id).includes(adminId);
        if (!adminAuthorized) {
            console.error('User forbidden from updating organization.');
            return res.status(403).json({
                message: 'User forbidden from updating organization.',
            });
        }

        // Fetch all member details from organization
        const verifiedMembersBeforeFetch = organization.members.filter(m => m.verified);
        const unverifiedMembersBeforeFetch = organization.members.filter(m => !m.verified);

        const verifiedMembersToFetch = verifiedMembersBeforeFetch.map(m => m._id);
        const unverifiedMembersToFetch = unverifiedMembersBeforeFetch.map(m => m._id);

        const verifiedMembersEmails = await req.db.collection<IUser>('users').find({ _id: { $in: verifiedMembersToFetch } }).project({ email: 1 }).toArray();
        const unverifiedMembersEmails = await req.db.collection<IUser>('unverifiedUsers').find({ _id: { $in: unverifiedMembersToFetch } }).project({ email: 1 }).toArray();

        const verifiedMembers = verifiedMembersBeforeFetch.reduce<IMemberWithEmail[]>(
            (acc, m, i) => {
                const emailEntry = verifiedMembersEmails[i];
                if (!emailEntry) {
                    console.error(`Verified member with index ${i} not found.`);
                    return acc;
                }

                acc.push({
                    _id: m._id,
                    verified: m.verified,
                    email: emailEntry.email,
                });

                return acc;
            },
            [],
        );

        const unverifiedMembers = unverifiedMembersBeforeFetch.reduce<IMemberWithEmail[]>(
            (acc, m, i) => {
                const emailEntry = unverifiedMembersEmails[i];
                if (!emailEntry) {
                    console.error(`Unverified member with index ${i} not found.`);
                    return acc;
                }

                acc.push({
                    _id: m._id,
                    verified: m.verified,
                    email: emailEntry.email,
                });

                return acc;
            },
            [],
        );


        // Update members
        const { membersToDelete: verifiedMembersToDelete, newMembers: newVerifiedMembers } = getNewMembers(req.body.uploadedMembers, verifiedMembers);
        const { membersToDelete: unverifiedMembersToDelete, newMembers: newUnverifiedMembers } = getNewMembers(req.body.uploadedMembers, unverifiedMembers);

        const newByEmail = new Map<string, IUser>();

        for (const member of [ ...newVerifiedMembers, ...newUnverifiedMembers ]) {
            newByEmail.set(member.email, member);
        }

        const newMembers = [ ...newByEmail.values() ];

        if (newMembers.length !== 0) {
            const insertMembersResult = await req.db.collection<IUser>('users').insertMany(newMembers);

            if (insertMembersResult.insertedCount === 0) {
                console.info('No new users inserted.');
            }
        }

        // Delete members
        const deleteVerifiedResult = await req.db.collection<IUser>('users').deleteMany({ _id: { $in: verifiedMembersToDelete } });
        const deleteUnverifiedResult = await req.db.collection<IUser>('unverifiedUsers').deleteMany({ _id: { $in: unverifiedMembersToDelete } });

        if (deleteVerifiedResult.deletedCount === 0) {
            console.info('No verified users deleted.');
        }

        if (deleteUnverifiedResult.deletedCount === 0) {
            console.info('No unverified users deleted.');
        }

        const deleteByEmail = new Map<string, ObjectId>();

        for (const member of [ ...verifiedMembersToDelete, ...unverifiedMembersToDelete ]) {
            deleteByEmail.set(member.toString(), member);
        }

        const membersToDelete = [ ...deleteByEmail.values() ]

        const removeMembersFromOrgResult = await req.db.collection<IOrg>('organizations').updateOne(
            { _id: orgId },
            { $pull: { members: { _id: { $in: membersToDelete } } } }
        );
    }
});

/*
orgRouter.patch('/update/:id/', authenticateToken(), verifyRole('admin'), validateUpdateOrgSchema, async (req: Request, res: Response) => {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'Organization ID missing or invalid.',
        });
    }

    if (!req.body) {
        return res.status(400).json({
            message: 'Organization body missing.',
        });
    }

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID not found or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.params.id);

        const initialOrg = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!initialOrg) {
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        const adminId = new ObjectId(req.user.id);
        console.log('Admin ID:', adminId);

        const admin = await req.db.collection<IUser>('users').findOne({ _id: adminId });

        if (!adminId || !admin || !initialOrg.members.some(m => m._id.equals(adminId))) {
            console.log(initialOrg.members.map(m => m._id));
            return res.status(403).json({
                message: 'User is forbidden from updating the organization.',
            });
        }

        const { uploadedMembers, members, ...tempOrg } = (req.body as IUpdateOrg);

        const membersWithEmail = await req.db.collection<IUser>('users').find({ _id: { $in: initialOrg.members.map(m => m._id) } }).toArray();

        const membersToUpdate: IMemberWithEmail[] = [];

        for (let i = 0; i < membersWithEmail.length; i++) {
            const member = membersWithEmail[i];
            const oldMember = members[i];

            if (!member) {
                console.error('Member not found:', i);
                continue;
            }

            if (!oldMember) {
                console.error('Original member not found:', i);
                continue;
            }

            membersToUpdate[i] = { _id: member._id, verified: oldMember.verified, email: member.email };
        }

        let orgToUpdate: IUpdateOrg;

        if (uploadedMembers) {
            console.log('Uploaded members:', uploadedMembers);

            let parsedMembers: IMemberWithEmail[];

            try {
                parsedMembers = await parseOrgMembers(uploadedMembers, req.db, initialOrg.domains.filter(d => d.verified).map(d => d.domain), orgId, adminId, admin.email);
            } catch (error) {
                return res.status(400).json({
                    message: (error instanceof Error) ? error.message : 'An error occurred while parsing members.',
                });
            }

            orgToUpdate = { ...tempOrg, members: parsedMembers, _id: orgId };
        } else {
            orgToUpdate = { ...tempOrg, members: membersToUpdate };
        }

        console.log('Organization to update:', orgToUpdate);

        const mappedOrgToDomain = initialOrg.domains.map(d => d.domain);

        for (const [index, domain] of orgToUpdate.domains.entries()) {
            if (!orgToUpdate.domains[index]) {
                console.error('Domain object missing.');
                return res.status(400).json({
                    message: 'Domain object missing.',
                });
            }

            orgToUpdate.domains[index].domain = addDomainPrefix(domain.domain);

            if (mappedOrgToDomain.includes(domain.domain)) continue;

            if (!checkValidDomain(domain.domain)) {
                return res.status(400).json({
                    message: `Domain '${domain.domain}' is invalid.`,
                });
            }

            console.log('Converted domain string to IDomain:', orgToUpdate.domains[index]);

            const verificationToken = createVerificationToken();
            console.log('Verification token:', verificationToken);
            orgToUpdate.domains[index].verificationToken = verificationToken;
        }

        const conflict = await req.db.collection<IOrg>('organizations').findOne({
            domains: {
                _id: { $ne: orgId },
                $elemMatch: {
                    domain: { $in: orgToUpdate.domains.map(d => d.domain) },
                    verified: true,
                },
            }
        });

        if (conflict) {
            const matchedDomain = conflict.domains.find(d => orgToUpdate.domains.map(d => d.domain).includes(d.domain) && d.verified)?.domain;

            return res.status(409).json({
                message: `Organization with domain '${matchedDomain}' already exists.`,
            });
        }

        const result = await req.db.collection('organizations').updateOne(
            { _id: orgId },
            { $set: orgToUpdate },
        );

        if (result.matchedCount === 0) {
            console.error('Organization not found.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        const { verifiedMembers, unverifiedMembers } = getMembersToDelete(orgToUpdate.members, membersToUpdate);

        let deleteFailures: string[] = [];

        if (verifiedMembers.length !== 0) {
            const deleteVerified = await req.db.collection<IUser>('users').deleteMany({ _id: { $in: verifiedMembers } });

            if (deleteVerified.deletedCount === 0) {
                console.error('Failed to delete verified members.');
                deleteFailures.push('Failed to delete verified members.');
            }
        }

        if (unverifiedMembers.length !== 0) {
            const deleteUnverified = await req.db.collection<IUser>('users').deleteMany({ _id: { $in: unverifiedMembers } });

            if (deleteUnverified.deletedCount === 0) {
                console.error('Failed to delete unverified members.');
                deleteFailures.push('Failed to delete unverified members.')
            }
        }

        console.log('Successfully updated organization.');

        return res.status(200).json({
            message: 'Successfully updated organization.',
            deleteFailures: deleteFailures,
        });
    } catch (error) {
        console.error('An error occurred while updating organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while updating the organization.',
        });
    }
});
*/