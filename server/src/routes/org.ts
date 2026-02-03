import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId, type AnyBulkWriteOperation, type InsertOneModel, type UpdateFilter, type UpdateOneModel } from 'mongodb';
import { validateCreateOrgSchema, validateUpdateOrgSchema } from '../middleware/validate_schema.js';
import type { ICreateOrg, IOrg, IUpdateOrg } from '../interfaces/Org.js';
import { createVerificationToken, verifyDomainTxt, verifyDomainHttp, parseOrgMembers, checkValidDomain, addDomainPrefix, getNewMembers } from '../utils/org_utils.js';
import type { IDomain, IEditDomain } from '../interfaces/Domain.js';
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
            orgToCreate.domains[index].verified = false;
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

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID missing or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.body.id);
        const domainToVerify = req.body.domain;
        const adminId = new ObjectId(req.user.id);

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

        if (existingVerifiedOrg && existingVerifiedOrg._id.toString() !== orgId.toString()) {
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

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id), domainToVerify, adminId);
        
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

    if (!req.user?.id || !ObjectId.isValid(req.user.id)) {
        console.error('User ID missing or invalid.');
        return res.status(400).json({
            message: 'User ID missing or invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.body.id);
        const domainToVerify = req.body.domain;
        const adminId = new ObjectId(req.user.id);

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

        if (existingVerifiedOrg && existingVerifiedOrg._id.toString() !== orgId.toString()) {
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

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id), domainToVerify, adminId);

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
TODO: BATCH EVERYTHING INTO 1 NETWORK REQUEST
~ 1. Verify whether user can edit organization
~2. Compare members to keep vs original org
~3. Delete members that are NOT part of the organization
~4. Parse members again
~5. DO NOT recreate verification token and keep verification status for existing domains the same
~6. Add NEW domains (unverified) to the organization
~7. Compare diff and update
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

    const session = req.client.startSession();

    try {
        const orgOps: AnyBulkWriteOperation<IOrg>[] = [];
        const verifiedUserOps: AnyBulkWriteOperation<IUser>[] = [];
        const unverifiedUserOps: AnyBulkWriteOperation<IUser>[] = [];
        const adminId = new ObjectId(req.user.id);
        const orgId = new ObjectId(req.params.id);
        const orgBody: IUpdateOrg = req.body;
        const memberUploaded: boolean = req.body.memberUploaded;

        if (memberUploaded) {
            delete (orgBody as IUpdateOrg & { memberUploaded?: boolean }).memberUploaded;
        }

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
        const adminAuthorized = organization.members.filter(m => m.verified).map(m => m._id.toString()).includes(adminId.toString());
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
        console.log('Member uploaded:', memberUploaded);

        if (memberUploaded) {
            const { membersToDelete: verifiedMembersToDelete, newMembers: newVerifiedMembers } = getNewMembers(req.body.uploadedMembers, verifiedMembers, adminId);
            const { membersToDelete: unverifiedMembersToDelete, newMembers: newUnverifiedMembers } = getNewMembers(req.body.uploadedMembers, unverifiedMembers, adminId);

            const verifiedDomains = organization.domains.filter(d => d.verified).map(d => d.domain);

            const newByEmail = new Map<string, IStoredMember>();
            const newVerified = new Map<string, IUser>();
            const newUnverified = new Map<string, IUser>();

            for (const member of [ ...newVerifiedMembers, ...newUnverifiedMembers ]) {
                if (!member._id) {
                    console.error('Member ID not found.');
                    continue;
                }

                let memberToAdd: IStoredMember;

                if (verifiedDomains.includes(getDomain(member.email))) {
                    memberToAdd = { _id: member._id, verified: true };
                    newVerified.set(member.email, member);
                } else {
                    memberToAdd = { _id: member._id, verified: false };
                    newUnverified.set(member.email, member);
                }

                newByEmail.set(member.email, memberToAdd);
            }

            const newMembers = [ ...newByEmail.values() ];
            const newMemberToInsertVerified = [ ...newVerified.values() ];
            const newMemberToInsertUnverified = [ ...newUnverified.values() ];

            if (newMembers.length !== 0) {
                const newMembersToInsertVerifiedTemplate = newMemberToInsertVerified.map(m => ({
                    insertOne: {
                        document: m,
                    },
                } as AnyBulkWriteOperation<IUser>));

                const newMembersToInsertUnverifiedTemplate = newMemberToInsertUnverified.map(m => ({
                    insertOne: {
                        document: m,
                    },
                } as AnyBulkWriteOperation<IUser>));

                verifiedUserOps.push(...newMembersToInsertVerifiedTemplate);
                unverifiedUserOps.push(...newMembersToInsertUnverifiedTemplate);
            }

            // Delete members
            verifiedUserOps.push({
                deleteMany: {
                    filter: { _id: { $in: verifiedMembersToDelete } },
                },
            });

            unverifiedUserOps.push({
                deleteMany: {
                    filter: { _id: { $in: unverifiedMembersToDelete } },
                },
            });

            const deleteByEmail = new Map<string, ObjectId>();

            for (const member of [ ...verifiedMembersToDelete, ...unverifiedMembersToDelete ]) {
                deleteByEmail.set(member.toString(), member);
            }

            const membersToDelete = [ ...deleteByEmail.values() ];

            // Add new and delete old
            orgOps.push({
                updateOne: {
                    filter: { _id: orgId },
                    update: { $addToSet: { members: { $each: newMembers } } },
                },
            });

            orgOps.push({
                updateOne: {
                    filter: { _id: orgId },
                    update: { $pull: { members: { _id: { $in: membersToDelete } } } },
                },
            });
        }

        // Domain verification
        const currentDomains = organization.domains;

        orgBody.domains = orgBody.domains.map(d => ({ domain: addDomainPrefix(d.domain), verificationToken: d.verificationToken, verified: d.verified } as IEditDomain));

        const newDomains = new Map<string, IDomain>();
        const domainsToDelete = new Map<string, IEditDomain>();

        for (const domain of [ ...currentDomains, ...orgBody.domains ]) {
            // Check if domain exists
            if (currentDomains.map(d => d.domain).includes(domain.domain)) continue;

            // Check for domain to delete
            if (!orgBody.domains.map(d => d.domain).includes(domain.domain)) {
                domainsToDelete.set(domain.domain, domain);
                continue;
            }

            // Note: client side sends ONLY the domains, not the verification tokens and verified status
            // However, ONLY the NEW domains are here at this point, as filtered earlier
            domain.verified = false;

            // For unique domains - first if statement already checks if domain ALREADY exists
            if (!domain.verificationToken || domain.verificationToken === '') {
                domain.verificationToken = createVerificationToken();
            }

            newDomains.set(domain.domain, domain as IDomain);
        }

        const newDomainsArray = [ ...newDomains.values() ];
        const domainsToDeleteArray = [ ...domainsToDelete.values() ];

        orgOps.push({
            updateOne: {
                filter: { _id: orgId },
                update: {
                    $addToSet: { domains: { $each: newDomainsArray } }, // Add new domains
                },
            },
        });

        orgOps.push({
            updateOne: {
                filter: { _id: orgId },
                update: {
                    $pull: { domains: { domain: { $in: domainsToDeleteArray.map(d => d.domain) } } }, // Remove old domains
                }
            },
        });

        // In the future, maybe add the user deletion for that domain???

        // Compare diff and update
        /*
        Organization contains:
            _id - no need - unique
            name - THIS ONE TO EDIT
            domains - already added; will be omitted
            members - already added; will be omitted
        */

        orgOps.push({
            updateOne: {
                filter: { _id: orgId },
                update: { $set: { name: orgBody.name } },
            }
        });

        await session.withTransaction(async () => {
            await req.db.collection<IOrg>('organizations').bulkWrite(orgOps, { session });
            if (memberUploaded) {
                await req.db.collection<IUser>('users').bulkWrite(verifiedUserOps, { session });
                await req.db.collection<IUser>('unverifiedUsers').bulkWrite(unverifiedUserOps, { session });
            }
        });

        console.log('Successfully updated organization.');
        
        return res.status(200).json({
            message: 'Successfully updated organization.',
        });
    } catch (error) {
        console.error('An internal server error occurred while updating organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while updating organization.',
        });
    } finally {
        await session.endSession();
    }
});

orgRouter.delete('/delete/:id/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.params.id || !ObjectId.isValid(req.params.id)) {
        console.error('Organization ID is missing or invalid.');
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

    const session = req.client.startSession();

    try {
        const verifiedUserOps: AnyBulkWriteOperation<IUser>[] = [];
        const unverifiedUserOps: AnyBulkWriteOperation<IUser>[] = [];
        const adminId = new ObjectId(req.user.id);
        const orgId = new ObjectId(req.params.id);

        const adminUser = await req.db.collection<IUser>('users').findOne({ _id: adminId });

        if (!adminUser) {
            console.error('Admin not found.');
            return res.status(404).json({
                message: 'Admin not found.',
            });
        }

        const organization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!organization) {
            console.error('Organization not found.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        // Check admin authorized
        const adminAuthorized = organization.members.filter(m => m.verified).map(m => m._id.toString()).includes(adminId.toString());
        if (!adminAuthorized) {
            console.error('User forbidden from updating organization.');
            return res.status(403).json({
                message: 'User forbidden from updating organization.',
            });
        }

        // Delete members
        const verifiedOrgMembers = organization.members.filter(m => (m.verified && m._id.toString() !== adminId.toString())).map(m => m._id);
        const unverifiedOrgMembers = organization.members.filter(m => !m.verified).map(m => m._id);

        verifiedUserOps.push({
            deleteMany: {
                filter: { _id: { $in: verifiedOrgMembers } },
            },
        });

        unverifiedUserOps.push({
            deleteMany: {
                filter: { _id: { $in: unverifiedOrgMembers } },
            },
        });

        // In the future, maybe delete exams

        // Final bulk write
        await session.withTransaction(async () => {
            await req.db.collection<IOrg>('organizations').deleteOne({ _id: orgId });
            await req.db.collection<IUser>('users').updateOne({ _id: adminId }, { $pull: { organizations: orgId } });
            if (verifiedOrgMembers.length !== 0) await req.db.collection<IUser>('users').bulkWrite(verifiedUserOps);
            if (unverifiedOrgMembers.length !== 0) await req.db.collection<IUser>('unverifiedUsers').bulkWrite(unverifiedUserOps);
        });

        console.log('Successfully deleted organization.');

        return res.status(200).json({
            message: 'Successfully deleted organization.',
        });
    } catch (error) {
        console.error('An error occurred while deleting organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while deleting organization.',
        });
    } finally {
        await session.endSession();
    }
});