<template>
  <div v-if="outfit" class="container py-4">

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="$router.back()">
        ← Back
      </button>

      <div class="btn-group">
        <button class="btn btn-light" @click="toggleFavorite">
          {{ outfit.favorite ? '❤️' : '🤍' }}
        </button>

        <button class="btn btn-light" @click="editOutfit">✏️</button>

        <button class="btn btn-danger" @click="confirmDelete">🗑️</button>
      </div>
    </div>

    <div class="row g-4">

      <!-- Image Section -->
      <div class="col-12">
        <div class="card shadow-sm overflow-hidden">
          <img
            v-if="outfit.imageUrl"
            :src="outfit.imageUrl"
            :alt="outfit.title"
            class="img-fluid"
          />

          <!-- Composition Grid -->
          <div
            v-else
            class="row row-cols-2 p-4 g-3 bg-white"
          >
            <div
              v-for="item in outfit.itemDetails"
              :key="item.id"
              class="col"
            >
              <div class="card h-100 d-flex align-items-center justify-content-center bg-light">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  class="img-fluid"
                />
                <div v-else class="display-5 text-white bg-primary w-100 py-4 text-center">
                  {{ getCategoryIcon(item.category) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="col-12">
        <div class="card p-4 shadow-sm">
          <h2 class="fw-bold mb-2">{{ outfit.title }}</h2>

          <p v-if="outfit.description" class="text-muted">
            {{ outfit.description }}
          </p>
          <p v-else class="text-muted fst-italic">No description</p>

          <!-- Outfits items -->
          <h4 class="mt-4">Items in this outfit</h4>

          <div class="list-group my-3">
            <div
              v-for="item in outfit.itemDetails"
              :key="item.id"
              class="list-group-item list-group-item-action d-flex align-items-center"
              @click="$router.push(`/app/clothing/${item.id}`)"
            >
              <img
                v-if="item.imageUrl"
                class="rounded me-3"
                width="60"
                height="60"
                :src="item.imageUrl"
              />

              <div v-else class="rounded bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style="width: 60px; height: 60px;">
                {{ getCategoryIcon(item.category) }}
              </div>

              <div>
                <div class="fw-semibold">{{ item.name }}</div>
                <div class="text-primary small">{{ item.category }}</div>
                <div class="text-muted small" v-if="item.color">{{ item.color }}</div>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="row g-3 mt-4">
            <div class="col-md-4" v-if="outfit.season">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Season</div>
                <div class="fw-semibold">{{ outfit.season }}</div>
              </div>
            </div>

            <div class="col-md-4" v-if="outfit.event">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Event</div>
                <div class="fw-semibold">{{ outfit.event }}</div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="border rounded p-3 bg-light">
                <div class="fw-medium text-secondary">Created</div>
                <div class="fw-semibold">{{ formatDate(outfit.createdAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="outfit.tags && outfit.tags.length" class="mt-4">
            <h4>Tags</h4>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <span v-for="tag in outfit.tags" :key="tag" class="badge bg-primary px-3 py-2">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary"></div>
    <p class="mt-3 text-muted">Loading...</p>
  </div>
</template>

<script>
import { useDocument } from "vuefire";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "OutfitDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const outfitRef = doc(db, "outfits", route.params.id);
    const outfit = useDocument(outfitRef);

    return { outfit, route, router };
  },
  methods: {
    getCategoryIcon(category) {
      const icons = {
        Tops: "👕",
        Bottoms: "👖",
        Shoes: "👟",
        Accessories: "👒",
        Outerwear: "🧥",
        Dresses: "👗",
      };
      return icons[category] || "👕";
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },

    async toggleFavorite() {
      try {
        await updateDoc(doc(db, "outfits", this.route.params.id), {
          favorite: !this.outfit.favorite,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error("Favorite update failed:", err);
      }
    },

    editOutfit() {
      this.$router.push(`/app/outfits/${this.outfit.id}/edit`);
    },

    confirmDelete() {
      if (confirm("Are you sure you want to delete this outfit?")) {
        this.deleteOutfit();
      }
    },

    async deleteOutfit() {
      try {
        await deleteDoc(doc(db, "outfits", this.route.params.id));
        this.$router.push("/app/outfits");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete outfit");
      }
    },
  },
};
</script>
