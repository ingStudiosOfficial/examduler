import { Router, type Request, type Response } from 'express';
import { authenticateToken, verifyRole } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { validateCreateOrgSchema } from '../middleware/validate_schema.js';
import type { ICreateOrg, IOrg } from '../interfaces/Org.js';
import { createVerificationToken, verifyDomainTxt, verifyDomainHttp, parseOrgMembers, checkValidDomain, addDomainPrefix } from '../utils/org_utils.js';
import type { IDomain } from '../interfaces/Domain.js';
import { verifyUsers } from '../utils/user_utils.js';

export const orgRouter = Router();

orgRouter.get('/fetch/:id/', authenticateToken(), verifyRole('admin'), async (req: Request, res: Response) => {
    if (!req.params.id) {
        return res.status(400).json({
            message: 'Organization ID missing.',
        });
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'Organization ID invalid.',
        });
    }

    try {
        const orgId = new ObjectId(req.params.id);

        const organization = req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!organization) {
            console.error('Organization with ID not found:', orgId);
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }

        return res.status(200).json({
            message: 'Organization found successfully.',
            organization: organization,
        });
    } catch (error) {
        console.error('Error while fetching organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while fetching the organization.',
        });
    }
});

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
        const parsedMembers = await parseOrgMembers(members, req.db, [], orgId, adminId);
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

            const orgExists = await req.db.collection<IOrg>('organizations').findOne({ 'domains.domain': domain.domain });

            let foundDomain: IDomain | undefined;
            if (orgExists) {
                foundDomain = orgExists.domains.find((matchedDomain: IDomain) => matchedDomain.domain === domain.domain);
            }

            if (foundDomain && foundDomain.verified) {
                console.error('Organization already exists.');
                return res.status(409).json({
                    message: `Organization with domain ${domain.domain} already exists.`,
                });
            }

            const verificationToken = createVerificationToken();
            console.log('Verification token:', verificationToken);
            orgToCreate.domains[index].verificationToken = verificationToken;
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

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id));
        
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

        await verifyUsers(req.db, organization.members.filter(m => m.verified === false).map(m => m._id));

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

    try {
        const orgId = new ObjectId(req.params.id);

        const fetchedOrganization = await req.db.collection<IOrg>('organizations').findOne({ _id: orgId });

        if (!fetchedOrganization) {
            console.error('Organization not found.');
            return res.status(404).json({
                message: 'Organization not found.',
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