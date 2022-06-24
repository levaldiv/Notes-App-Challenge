<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignInEmailPassword, useSignUpEmailPassword } from "@nhost/vue";

const router = useRouter();

// if user doesnt have an acct
const isRegistered = ref(false);

// if they have an acct
const email = ref("");
const password = ref("");

const { signUpEmailPassword } = useSignUpEmailPassword();
const { signInEmailPassword } = useSignInEmailPassword();

// logging in the user
const registerOrLogin = async () => {
  if (!email.value || !password.value) {
    return alert("Please fill in all fields!");
  }

  const res = isRegistered.value
    ? await signUpEmailPassword(email.value, password.value)
    : await signInEmailPassword(email.value, password.value);

  if (res.isError) return alert(res.error.message);

  // pushing to home page if user logged in
  router.push("/");
};
</script>

<template>
  <main>
    <h1 class="text-4xl font-bold mb-8">Notes App</h1>

    <form class="border border-gray-500 p-5 mt-16" @submit.prevent="registerOrLogin">
      <h3 class="text-xl font-bold uppercase mb-4">{{ isRegistered ? "Register" : "Login" }} Form</h3>

      <label class="block mb-4 outline-none">
        <span class="block text-sm uppercase mb-2">Email</span>
        <input type="email" v-model="email" class="block w-full text-slate-800 px-4 py-2" />
      </label>
      
      <label class="block mb-4">
        <span class="block text-sm uppercase mb-2">Password</span>
        <input type="password" v-model="password" class="block w-full text-slate-800 px-4 py-2"/>
      </label>

      <div class="flex items-center space-x-3 mt-5 justify-center">
          <div>
              <button class="rounded-full bg-blue-100 py-2 px-4 text-sm font-bold transition duration-300 ease-out hover:scale-105">
                <input type="submit" :value="isRegistered ? 'Register' : 'Login'" class="text-black cursor-pointer" />
              </button>
          </div>
    
          <div>
              <p>
                <button type="button" @click="() => isRegistered = !isRegistered" class="rounded-full text-black bg-blue-100 py-2 px-4 text-sm font-bold transition duration-300 ease-out hover:scale-105">
                  {{ isRegistered ? 'Login' : 'Register'}}
                </button>
              </p>
          </div>
      </div>

    </form>
  </main>
</template>
