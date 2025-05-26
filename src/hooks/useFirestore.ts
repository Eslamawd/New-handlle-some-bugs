
import { useState } from "react";
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  CollectionReference,
  Query
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/lib/toast";

export function useFirestore(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectionRef = collection(db, collectionName);

  const getDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      setLoading(false);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error fetching document: ${err.message}`);
      throw err;
    }
  };

  const getDocuments = async (constraints?: { 
    field?: string; 
    operator?: "==" | "<" | "<=" | ">" | ">="; 
    value?: any;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    limitCount?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      let q: Query<DocumentData> = collectionRef;
      
      if (constraints) {
        if (constraints.field && constraints.operator && constraints.value !== undefined) {
          q = query(q, where(constraints.field, constraints.operator, constraints.value));
        }
        
        if (constraints.orderByField) {
          const direction = constraints.orderDirection || "asc";
          q = query(q, orderBy(constraints.orderByField, direction));
        }
        
        if (constraints.limitCount) {
          q = query(q, limit(constraints.limitCount));
        }
      }
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLoading(false);
      return documents;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error fetching documents: ${err.message}`);
      throw err;
    }
  };

  const addDocument = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date().toISOString()
      });
      setLoading(false);
      toast.success("Document added successfully!");
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error adding document: ${err.message}`);
      throw err;
    }
  };

  const updateDocument = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setLoading(false);
      toast.success("Document updated successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error updating document: ${err.message}`);
      throw err;
    }
  };

  const setDocument = async (id: string, data: any, merge = true) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge });
      setLoading(false);
      toast.success("Document set successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error setting document: ${err.message}`);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setLoading(false);
      toast.success("Document deleted successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error deleting document: ${err.message}`);
      throw err;
    }
  };

  return {
    loading,
    error,
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    setDocument,
    deleteDocument
  };
}
