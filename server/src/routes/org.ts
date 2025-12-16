import { Router, type Request, type Response } from "express";
import { authenticateToken, verifyRole } from "../middleware/auth.js";
import { ObjectId } from "mongodb";
import { validateCreateOrgSchema } from "../middleware/validate_schema.js";
import type { IOrg } from "../interfaces/Org.js";
import { createVerificationToken, verifyDomain } from "../utils/org_utils.js";
import type { IDomain } from "../interfaces/Domain.js";

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

        const organization = req.db.collection('organizations').findOne({ _id: orgId });

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
        })
    }
});

orgRouter.post('/create/', authenticateToken(), verifyRole('admin'), validateCreateOrgSchema, async (req: Request, res: Response) => {
    const orgToCreate: IOrg = req.body;

    try {
        for (const [index, domain] of orgToCreate.domains.entries()) {
            if (!orgToCreate.domains[index]) {
                console.error('Domain object missing.');
                return res.status(400).json({
                    message: 'Domain object missing.',
                });
            }

            const orgExists = await req.db.collection('organizations').findOne({ 'domains.domain': domain.domain });

            if (orgExists && orgExists.domains.find((matchedDomain: IDomain) => matchedDomain.domain === domain.domain)) {
                console.error('Organization already exists.');
                return res.status(409).json({
                    message: `Organization with domain ${domain.domain} already exists.`,
                });
            }

            const verificationToken = createVerificationToken();
            orgToCreate.domains[index].verificationToken = verificationToken;
        }

        const result = await req.db.collection('organizations').insertOne(orgToCreate);

        if (!result.insertedId) {
            console.error('Failed to insert organization.');
            return res.status(500).json({
                message: 'An internal server error occurred while inserting exam',
            })
        }
    } catch (error) {
        console.error('An error occurred while creating organization:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while creating the organization.',
        });
    }
});

orgRouter.post('/verify/', authenticateToken(), verifyRole('admin'), async (req, res) => {
    if (!req.body.id || !req.body.domain) {
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

        const organization = await req.db.collection('organizations').findOne({ _id: orgId });

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

        const fetchedDomain: IDomain = organization.domains.find((matchedDomain: IDomain) => matchedDomain.domain === domainToVerify);

        if (!fetchedDomain) {
            console.error('Domain to verify not linked to organization.');
            return res.status(403).json({
                message: 'Domain to verify not linked to organization.',
            });
        }

        const verified = await verifyDomain(domainToVerify, fetchedDomain.verificationToken);

        if (!verified) {
            console.error('Could not verify domain.');
            return res.status(422).json({
                message: 'TXT record not found or does not match verification token.',
            });
        }

        const updatedResult = await req.db.collection('organizations').updateOne(
            { _id: orgId, 'domains.domain': domainToVerify },
            { $set: { 'domains.$.verified': true } },
        );

        if (updatedResult.matchedCount === 0) {
            console.error('Could not find organization.');
            return res.status(404).json({
                message: 'Organization not found.',
            });
        }
    } catch (error) {
        console.error('Failed to verify domain:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while verifying domain.',
        });
    }
});