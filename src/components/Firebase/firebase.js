import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

class Firebase {
    constructor(){
        app.initializeApp(config);

        this.emailAuthProvider = app.auth.EmailAuthProvider;
        this.auth = app.auth();
        this.db = app.database();

        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();
    }

    // * * * START AUTH API * * * //
    doCreateUserWithEmailAndPassword = (e, p) => 
        this.auth.createUserWithEmailAndPassword(e, p);

    doSignInWithEmailAndPassword = (e, p) => 
        this.auth.signInWithEmailAndPassword(e, p);

    doSignInWithGoogle = () => 
        this.auth.signInWithPopup(this.googleProvider);

    doSignInWithTwitter = () =>
        this.auth.signInWithPopup(this.twitterProvider);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = e => this.auth.sendPasswordResetEmail(e);

    doPasswordUpdate = p =>
        this.auth.currentUser.updatePassword(p);

    doSendEmailVerification = () =>
        this.auth.currentUser.sendEmailVerification()
    // * * * END AUTH API * * * //

    // * * * START MERGE AUTH AND DB USER API * * * //
    onAuthUserListener = (next, fallback) => 
        this.auth.onAuthStateChanged(authUser => {
            if(authUser){
                this.user(authUser.uid)
                .once('value')
                .then(snapshot => {
                    const dbUser = snapshot.val();

                    // default empty roles
                    if (!dbUser.roles) {
                        dbUser.roles = {};
                    }

                    //merge auth and db user
                    authUser = {
                        uid: authUser.uid,
                        email: authUser.email,
                        emailVerified: authUser.emailVerified,
                        providerData: authUser.providerData,
                        ...dbUser
                    };

                    next(authUser);
                })
            } else {
                fallback();
            }
        })
    // * * * END MERGE AUTH AND DB USER API * * * //

    // * * * START USER API * * * //
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref(`users`);
    // * * * END USER API * * * //
}

export default Firebase;