import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { validateCreateOrgSchema, validateUpdateOrgSchema } from '../middleware/validate_schema.js';
import type { ICreateOrg, IOrg, IUpdateOrg } from '../interfaces/Org.js';
import { createVerificationToken, verifyDomainTxt, verifyDomainHttp, parseOrgMembers, checkValidDomain, addDomainPrefix } from '../utils/org_utils.js';
import type { IDomain } from '../interfaces/Domain.js';
import { getDomain, verifyUsers } from '../utils/user_utils.js';
import type { IStoredMember } from '../interfaces/Member.js';

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

        const adminId = new ObjectId(req.user?.id);

        const { members, ...tempOrg } = orgFromBody;

        let parsedMembers: IStoredMember[];

        try {
            parsedMembers = await parseOrgMembers(members, req.db, [], orgId, adminId);
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

    if (!req.user?.id) {
        return res.status(400).json({
            message: 'User ID not missing.',
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

    try {
        const orgId = new ObjectId(req.params.id);

        const initialOrg = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!initialOrg) {
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        const verifiedDomains = initialOrg.domains.filter(d => d.verified).map(d => d.domain);

        const adminId = new ObjectId(req.user?.id);
        console.log('Admin ID:', adminId);

        if (!adminId || !initialOrg.members.map(m => m._id.toString().includes(adminId.toString()))) {
            console.log(initialOrg.members.map(m => m._id));
            return res.status(403).json({
                message: 'User is forbidden from updating the organization.',
            });
        }

        const { uploadedMembers, members, ...tempOrg } = (req.body as IUpdateOrg);

        let orgToUpdate: IOrg;

        if (uploadedMembers) {
            console.log('Uploaded members:', uploadedMembers);

            let parsedMembers: IStoredMember[];

            try {
                parsedMembers = await parseOrgMembers(uploadedMembers, req.db, [], orgId, adminId);
            } catch (error) {
                return res.status(400).json({
                    message: (error instanceof Error) ? error.message : 'An error occurred while parsing members.',
                });
            }

            orgToUpdate = { ...tempOrg, members: parsedMembers, _id: orgId };
        } else {
            orgToUpdate = { ...tempOrg, members: members };
        }

        console.log('Organization to update:', orgToUpdate);

        for (const [index, domain] of orgToUpdate.domains.entries()) {
            if (!orgToUpdate.domains[index]) {
                console.error('Domain object missing.');
                return res.status(400).json({
                    message: 'Domain object missing.',
                });
            }
            
            orgToUpdate.domains[index].domain = addDomainPrefix(domain.domain);

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
                $elemMatch: {
                    domain: { $in: orgToUpdate.domains.map(d => d.domain) },
                    verified: true
                }
            }
        });

        if (conflict) {
            const matchedDomain = conflict.domains.find(d => 
                orgToUpdate.domains.map(d => d.domain).includes(d.domain) && d.verified
            )?.domain;

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

        console.log('Successfully updated organization.');

        return res.status(200).json({
            message: 'Successfully updated organization.',
        });
    } catch (error) {
        console.error('An error occurred while updating organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while updating the organization.',
        });
    }
});