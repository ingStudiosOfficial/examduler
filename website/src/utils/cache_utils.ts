import type { Exam } from "@/interfaces/Exam";
import type { Organization } from "@/interfaces/Org";
import type { User } from "@/interfaces/User";
import { openDB, type IDBPDatabase } from "idb";

async function getDb(): Promise<IDBPDatabase<unknown>> {
    const dbName = import.meta.env.VITE_IDB_NAME;
    const dbVer = Number(import.meta.env.VITE_IDB_VER);

    const db = await openDB(dbName, dbVer, {
        upgrade(db, oldVersion) {
            switch (oldVersion) {
                case 0:
                    if (!db.objectStoreNames.contains('exams')) {
                        db.createObjectStore('exams', { keyPath: '_id' });
                    }
                    if (!db.objectStoreNames.contains('organizations')) {
                        db.createObjectStore('organizations', { keyPath: '_id' });
                    }
                case 2:
                    if (!db.objectStoreNames.contains('user')) {
                        db.createObjectStore('user', { keyPath: '_id' });
                    }
                    
                    break;
            }
        },
    });

    return db;
}

export async function cacheExams(exams: Exam[]) {
    console.log('Caching examinations:', exams);

    const db = await getDb();

    const tx = db.transaction('exams', 'readwrite');

    await Promise.all([ ...exams.map(exam => tx.store.put(exam)) ]);
}

export async function fetchCachedExams(): Promise<Exam[]> {
    const db = await getDb();

    const cachedExams: Exam[] = await db.getAll('exams');

    return cachedExams;
}

export async function cacheUserData(userData: User) {
    console.log('Caching user data:', userData);

    const db = await getDb();

    await db.put('user', userData);
}

export async function fetchCachedUserData(): Promise<User | undefined> {
    const db = await getDb();

    const cachedUserData = await db.getAll('user');

    return cachedUserData[0];
}

export async function cacheOrganizations(organizations: Organization[]) {
    console.log('Caching organizations:', organizations);

    const db = await getDb();

    const tx = db.transaction('organizations', 'readwrite');

    await Promise.all([ ...organizations.map(organization => tx.store.put(organization)) ]);
}

export async function fetchCachedOrganizations(): Promise<Organization[]> {
    const db = await getDb();

    const cachedOrganizations: Organization[] = await db.getAll('organizations');

    return cachedOrganizations;
}