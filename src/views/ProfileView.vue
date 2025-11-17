<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">

        <div class="row">
          <!-- Left Column - Profile Info -->
          <div class="col-md-4 mb-4">
            <div class="card text-center shadow-sm">
              <div class="card-body">

                <!-- Profile Picture -->
                <div class="position-relative mb-3">
                  <img 
                    :src="userProfile.profilePic || defaultProfilePic" 
                    alt="Profile Picture"
                    class="rounded-circle img-fluid profile-pic"
                    @error="handleImageError"
                  >
                  <button 
                    class="btn btn-outline-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                    style="width:36px; height:36px;"
                    @click="triggerFileInput"
                  >
                    <i class="fas fa-camera"></i>
                  </button>
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*"
                    class="d-none"
                    @change="handleProfilePicChange"
                  >
                </div>

                <!-- Editable Name and Username -->
                <div class="mb-2">
                  <span 
                    class="editable-name fw-bold fs-5 d-block" 
                    contenteditable
                    @blur="saveName"
                  >{{ userProfile.name || 'Your Name' }}</span>
                  <span 
                    class="editable-username text-muted d-block" 
                    contenteditable
                    @blur="saveUsername"
                  >@{{ userProfile.username || 'username' }}</span>
                </div>

                <!-- Bio -->
                <textarea 
                  v-model="userProfile.bio"
                  class="form-control mb-2"
                  rows="3"
                  placeholder="Tell us about your style..."
                  @blur="saveProfile"
                ></textarea>
                <small class="text-muted">Click outside to save</small>
              </div>
            </div>
          </div>

          <!-- Right Column - Details & Settings -->
          <div class="col-md-8">

            <!-- About Me -->
            <div class="card mb-4 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">About Me</h5>
              </div>
              <div class="card-body">

                <div class="row mb-3">
                  <div class="col-sm-4 mb-2">
                    <label class="form-label fw-bold">Shirt Size</label>
                    <select class="form-select" v-model="userProfile.shirtSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option>XS</option>
                      <option>S</option>
                      <option>M</option>
                      <option>L</option>
                      <option>XL</option>
                      <option>XXL</option>
                    </select>
                  </div>
                  <div class="col-sm-4 mb-2">
                    <label class="form-label fw-bold">Shoes</label>
                    <select class="form-select" v-model="userProfile.shoeSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in shoeSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                  <div class="col-sm-4 mb-2">
                    <label class="form-label fw-bold">Pants</label>
                    <select class="form-select" v-model="userProfile.pantsSize" @change="saveProfile">
                      <option value="">Select Size</option>
                      <option v-for="size in pantsSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </div>
                </div>

                <!-- Additional Stats -->
                <div class="row text-center">
                  <div class="col-6 border-end">
                    <div class="h5 text-primary">{{ stats.clothesCount }}</div>
                    <small class="text-muted d-block"># of clothes</small>
                  </div>
                  <div class="col-6">
                    <div class="h5 text-primary">{{ stats.outfitsCount }}</div>
                    <small class="text-muted d-block"># of outfits</small>
                  </div>
                </div>

              </div>
            </div>

            <!-- Site Settings -->
            <div class="card mb-4 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Site Settings</h5>
              </div>
              <div class="card-body">

                <div class="row mb-3 align-items-center">
                  <div class="col-sm-4 fw-bold">Theme</div>
                  <div class="col-sm-8">
                    <select class="form-select" v-model="userSettings.theme" @change="applyTheme">
                      <option value="auto">Auto</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary" @click="logout">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
              </button>
              <button class="btn btn-outline-danger" @click="showDeleteConfirm = true">
                <i class="fas fa-trash me-2"></i>Delete Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Delete Account</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <p class="text-danger fw-bold">All your clothes, outfits, and data will be permanently deleted.</p>
            <input type="text" v-model="deleteConfirmation" class="form-control" placeholder='Type "DELETE" to confirm'>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn-danger" :disabled="deleteConfirmation !== 'DELETE'" @click="deleteAccount">
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut, deleteUser } from 'firebase/auth';
import { db, storage, auth } from '../firebase.js';

export default {
  name: 'ProfileView',
  data() {
    return {
      userProfile: {
        name: '',
        username: '',
        bio: '',
        profilePic: '',
        shirtSize: '',
        shoeSize: '',
        pantsSize: ''
      },
      userSettings: {
        theme: 'auto',
        notifications: true,
        emailUpdates: true
      },
      stats: {
        clothesCount: 0,
        outfitsCount: 0
      },
      showDeleteConfirm: false,
      deleteConfirmation: '',
      defaultProfilePic: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZTZmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWM5YzljIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIFBob3RvPC90ZXh0Pjwvc3ZnPg==',
      shoeSizes: [],
      pantsSizes: []
    };
  },
  async mounted() {
    await this.loadUserProfile();
    await this.loadUserStats();
    await this.loadUserSettings();
    this.generateSizeOptions();
    this.applyTheme();
  },
  methods: {
    async loadUserProfile() {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          this.userProfile = { ...userDoc.data() };
        } else {
          this.userProfile = {
            name: auth.currentUser.displayName || '',
            username: auth.currentUser.email?.split('@')[0] || '',
            bio: '',
            profilePic: '',
            shirtSize: '',
            shoeSize: '',
            pantsSize: ''
          };
          await this.saveProfile();
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadUserStats() {
      if (!auth.currentUser) return;
      try {
        const clothingSnapshot = await getDocs(query(collection(db, 'clothing'), where('userId', '==', auth.currentUser.uid)));
        this.stats.clothesCount = clothingSnapshot.size;
        const outfitsSnapshot = await getDocs(query(collection(db, 'outfits'), where('userId', '==', auth.currentUser.uid)));
        this.stats.outfitsCount = outfitsSnapshot.size;
      } catch (error) {
        console.error(error);
      }
    },
    async loadUserSettings() {
      if (!auth.currentUser) return;
      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', auth.currentUser.uid));
        if (settingsDoc.exists()) this.userSettings = { ...settingsDoc.data() };
      } catch (error) {
        console.error(error);
      }
    },
    generateSizeOptions() {
      this.shoeSizes = Array.from({length: 17}, (_, i) => (5 + i*0.5).toString());
      this.pantsSizes = Array.from({length: 8}, (_, i) => (28 + i*2).toString());
    },
    async saveProfile() {
      if (!auth.currentUser) return;
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { ...this.userProfile, updatedAt: new Date() });
      } catch (error) { console.error(error); }
    },
    saveName(event) {
      this.userProfile.name = event.target.innerText.trim();
      this.saveProfile();
    },
    saveUsername(event) {
      this.userProfile.username = event.target.innerText.trim().replace(/\s+/g,'');
      this.saveProfile();
    },
    async saveSettings() {
      if (!auth.currentUser) return;
      try {
        await setDoc(doc(db, 'userSettings', auth.currentUser.uid), { ...this.userSettings, updatedAt: new Date() });
      } catch (error) { console.error(error); }
    },
    applyTheme() {
      const theme = this.userSettings.theme;
      if (theme==='dark'||(theme==='auto' && window.matchMedia('(prefers-color-scheme: dark)').matches))
        document.body.setAttribute('data-bs-theme','dark');
      else
        document.body.setAttribute('data-bs-theme','light');
      this.saveSettings();
    },
    triggerFileInput() { this.$refs.fileInput.click(); },
    async handleProfilePicChange(event) {
      const file = event.target.files[0]; if (!file) return;
      try {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        this.userProfile.profilePic = downloadURL;
        await this.saveProfile();
        event.target.value = '';
      } catch (error) { console.error(error); alert('Error uploading profile picture'); }
    },
    handleImageError(event) { event.target.src = this.defaultProfilePic; },
    async logout() { try { await signOut(auth); this.$router.push('/'); } catch(e){console.error(e);} },
    async deleteAccount() { 
      if(this.deleteConfirmation!=='DELETE') return;
      try {
        const user = auth.currentUser;
        if(!user){ alert('No user logged in'); return; }
        await this.deleteUserData(user.uid);
        await deleteUser(user);
        this.$router.push('/');
      } catch (error) { console.error(error); if(error.code==='auth/requires-recent-login'){ alert('Please log in again'); await this.logout(); } else { alert('Error deleting account.'); } }
    },
    async deleteUserData(userId){
      try{
        await deleteDoc(doc(db,'users',userId));
        await deleteDoc(doc(db,'userSettings',userId));
        const clothingSnapshot = await getDocs(query(collection(db,'clothing'), where('userId','==',userId)));
        await Promise.all(clothingSnapshot.docs.map(doc=>deleteDoc(doc.ref)));
        const outfitsSnapshot = await getDocs(query(collection(db,'outfits'), where('userId','==',userId)));
        await Promise.all(outfitsSnapshot.docs.map(doc=>deleteDoc(doc.ref)));
        try{ await deleteObject(ref(storage, `profilePictures/${userId}`)); }catch(e){console.log('No profile pic to delete');}
      }catch(e){console.error(e); throw e;}
    }
  }
};
</script>

<style scoped>
.profile-pic { width:150px; height:150px; object-fit:cover; border:4px solid #6f42c1; }
.editable-name, .editable-username {
  padding: 2px 4px;
  border-radius: 4px;
}
.editable-name:hover, .editable-username:hover,
.editable-name:focus, .editable-username:focus {
  outline: 2px solid #6f42c1;
  background-color: #f8f9fa;
}
</style>
