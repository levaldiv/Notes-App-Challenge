<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignOut, useUserId } from "@nhost/vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";

const router = useRouter();
const { signOut } = useSignOut();
const userId = useUserId();

const newNote = ref({
  title: "",
  content: "",
});

// logout event
const logout = () => {
  signOut();
  router.push("/login");
};

// using query allpws a query to graphql db
const {
  loading: notesLoading,
  result: notesResult,
  refetch: notesRefetch,
} = useQuery(
  gql`
    query ($userId: String!) {
      notes(
        order_by: { createdAt: desc }
        where: { user_id: { _eq: $userId } }
      ) {
        id
        title
        content
        createdAt
      }
    }
  `,
  {
    userId: userId.value,
  }
);

// using mutation to create a new note
const { mutate: createNote, onDone: createNoteDone } = useMutation(gql`
  mutation ($userId: String!, $title: String!, $content: String!) {
    insert_notes_one(
      object: { content: $content, title: $title, user_id: $userId }
    ) {
      id
    }
  }
`);

const handleCreateNote = () => {
  if (!newNote.value.title || !newNote.value.content) {
    return alert("Please fill in all fields!");
  }

  createNote({
    userId: userId.value,
    title: newNote.value.title,
    content: newNote.value.content,
  });
};

createNoteDone(() => {
  notesRefetch();
  newNote.value = {
    title: "",
    content: "",
  };
});

// creating delete method
const { mutate: deleteNote, onDone: deleteDone } = useMutation(gql`
  mutation ($id: Int!) {
    delete_notes(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`);

deleteDone(() => {
  notesRefetch();
});

const convertToHTML = (content) => {
  return content.replace(/\n/g, "<br />");
};

const convertToDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>

<template>
  <main>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">What's on your mind?</h1>
      <button @click="logout" class="rounded-full bg-red-500 py-2 px-4 text-sm font-bold transition duration-300 ease-out hover:scale-105">
        Logout
      </button>
    </div>

    <form @submit.prevent="handleCreateNote" class="mb-8">
      <label class="block mb-4">
        <span class="block text-sm uppercase mb-2">Title</span>
        <input
          type="text"
          v-model="newNote.title"
          class="block w-full text-slate-800 px-4 py-2"
        />
      </label>

      <label class="block mb-4">
        <span class="block text-sm uppercase mb-2">Content</span>
        <textarea
          v-model="newNote.content"
          class="block w-full text-slate-800 px-4 py-2">
        </textarea>
      </label>

      <div>
        <button class="rounded-full bg-blue-100 py-2 px-4 text-sm font-bold transition duration-300 ease-out hover:scale-105">
          <input
            type="submit"
            value="Create Note"
            class="text-black cursor-pointer"
          />
        </button>
      </div>
    </form>

    <!-- Displaying the notes -->
    <div v-if="!notesLoading">
      <div v-for="note in notesResult.notes" class="relative bg-white text-slate-700 rounded-lg p-6 mb-6">
        <button @click="() => deleteNote({ id: note.id })" class="absolute text-white top-6 right-6 rounded-full bg-red-500 py-2 px-4 text-sm font-bold transition duration-300 ease-out hover:scale-105">
          Delete Note
        </button>

        <h3 class="font-bold text-2xl mb-4">{{ note.title }}</h3>
        <p class="text-lg text-gray-500 mb-4" v-html="convertToHTML(note.content)"></p>

        <div class="text-sm text-gray-500 italic">
          {{ convertToDate(note.createdAt) }}
        </div>
      </div>
    </div>
    
    <div v-else>Loading Notes...</div>
  </main>
</template>
