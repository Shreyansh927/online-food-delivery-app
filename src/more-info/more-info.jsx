import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const ProfileInfo = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load user data when logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserDetails(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user details from Firestore
  const fetchUserDetails = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserDetails(docSnap.data());
    } else {
      await setDoc(docRef, { email: auth.currentUser.email }, { merge: true });
      setUserDetails({ email: auth.currentUser.email });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Upload image & save URL in Firestore
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image!");

    const user = auth.currentUser;
    if (!user) return alert("User not logged in!");

    try {
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(
        doc(db, "users", user.uid),
        { profileImage: downloadURL },
        { merge: true }
      );

      alert("Profile image uploaded!");
      console.log(downloadURL);
      setUserDetails((prev) => ({ ...prev, profileImage: downloadURL }));
      setPreview(null);
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Upload failed!");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Profile Info</h2>

      {userDetails && (
        <div>
          {userDetails.firstName && (
            <p>
              <b>First Name:</b> {userDetails.firstName}
            </p>
          )}
          {userDetails.lastName && (
            <p>
              <b>Last Name:</b> {userDetails.lastName}
            </p>
          )}
          <p>
            <b>Email:</b> {userDetails.email}
          </p>
          {userDetails.phoneNumber && (
            <p>
              <b>Phone.no:</b> {userDetails.phoneNumber}
            </p>
          )}
          {userDetails.profileImage && (
            <img
              src={userDetails.profileImage}
              alt="profile"
              style={{ width: "150px", borderRadius: "50%", marginTop: "10px" }}
            />
          )}
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div>
          <h3>Preview:</h3>
          <img
            src={preview}
            alt="preview"
            style={{ width: "150px", borderRadius: "50%", marginTop: "10px" }}
          />
        </div>
      )}

      <button onClick={handleUpload} style={{ marginTop: "15px" }}>
        Upload
      </button>
    </div>
  );
};

export default ProfileInfo;
