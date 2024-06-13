import { Injectable } from '@angular/core';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

import 'firebase/database';
// import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';

addRxPlugin(RxDBDevModePlugin);
replicateRxCollection(require('rxdb/plugins/replication'));
import {
  getDocs,
  query,
  serverTimestamp
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})


export class DatabaseService {
  constructor() {}
  get db(): any {
    return DB_INSTANCE;
  }
}

const projectId = environment.firebase.projectId;


// Create the database
async function _create(): Promise<any> {

  const db = await createRxDatabase({
    name: 'tukule-foods',
    storage: getRxStorageDexie(),
    multiInstance: true
  });

  
var userCollection = this.adb.collection('users');

const allDocsResult = await getDocs(query(userCollection));
allDocsResult.forEach(async (doc) => {
  const docRef: any = doc.ref;
  await docRef.update({
    _deleted: false,
    serverTimestamp: serverTimestamp()
  });
});


const replicationState = replicateFirestore({
  collection: 'users', // Your RxDB collection
  firestore: {
      projectId,
      database: this.adb.firestore(),
      collection: userCollection,
  },
  pull: {}, // Optional pull configuration
  push: {}, // Optional push configuration
  live: true, // Set to true for live replication (default)
  replicationIdentifier: 'unique-identifier' // Add this line
});

  }

  
let initState: null | Promise<any> = null;
let DB_INSTANCE: any;

/**
 * This is run via APP_INITIALIZER in app.module.ts
 * to ensure the database exists before the angular-app starts up
 */
export async function initDatabase() {
  /**
   * When server side rendering is used,
   * The database might already be there
   */
  if (!initState) {
    console.log('initDatabase()');
    initState = _create().then((db) => (DB_INSTANCE = db));
  }
  await initState;
}
