import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Historyy = () => {
  const [sear, setSear] = useState([]);

  useEffect(() => {
    let unsubscribeFirestore;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);

        // Subscribe to Firestore updates
        unsubscribeFirestore = onSnapshot(ref, (snap) => {
          if (snap.exists()) {
            setSear(snap.data().searchHistory || []);
          }
        });
      } else {
        setSear([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  return (
    <div>
      <h1>Your History</h1>
      <ul>
        {sear.map((each, index) => (
          <li key={each.thumbNailId || index}>{each.suggestion}</li>
        ))}
      </ul>
    </div>
  );
};

export default Historyy;
