import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyFakeKey_TKDMAIS_2026",
  authDomain: "tkdmais-extensao.firebaseapp.com",
  projectId: "tkdmais-extensao",
  storageBucket: "tkdmais-extensao.appspot.com",
  messagingSenderId: "999999999999",
  appId: "1:999999999999:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { firestore };