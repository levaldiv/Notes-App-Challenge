import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";

import { createApolloClient } from "@nhost/apollo";
import { NhostClient } from "@nhost/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";

import { createRouter, createWebHistory } from "vue-router";

/** Creating the Nhost Apollo Client **/
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN_NAME,
  region: import.meta.env.VITE_NHOST_REGION,
});

const apolloClient = createApolloClient({ nhost });

/** Setting up the routing config */
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("./views/Home.vue"),
    meta: {
      protected: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./views/Login.vue"),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

/** Creating a router guard to prohibit users from accessing routes without being logged in */
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.protected)) {
    const isAuthenticated = await nhost.auth.isAuthenticatedAsync();

    if (!isAuthenticated) {
      return next("/login");
    }
  }
  next();
});


createApp(App)
  .provide(DefaultApolloClient, apolloClient)
  .use(nhost)
  .use(router)
  .mount("#app");
