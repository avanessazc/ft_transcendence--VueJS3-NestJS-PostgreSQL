import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useUserStore } from "../store/user";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/signin",
    name: "signin",
    component: () => import("../views/SigninView.vue"),
    meta: {
      title: "Signin",
    },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("../views/SignupView.vue"),
    meta: {
      title: "Signup",
    },
  },
  {
    path: "/popup",
    name: "popup",
    component: () => import("../views/Popup.vue"),
    meta: {
      title: "Popup",
    },
  },
  {
    path: "/matchmaking",
    name: "matchmaking",
    component: () => import("../views/Matchmaking.vue"),
    meta: {
      title: "Matchmaking",
      needsAuth: true,
    },
  },
  {
    path: "/google/login/success/:update?",
    name: "googleloginsuccess",
    component: () => import("../views/HomeView.vue"),
    props: true,
    meta: {
      title: "Google Login Success",
    },
  },
  {
    path: "/google/login/failure",
    name: "googleloginfailure",
    component: () => import("../views/FailedLogin.vue"),
    meta: {
      title: "Google Login Failure",
    },
  },
  {
    path: "/google/login/emailtoolong",
    name: "emailtoolong",
    component: () => import("../views/EmailTooLong.vue"),
    meta: {
      title: "You are using a too long email address to signin/signup",
    },
  },
  {
    path: "/marvin/login/success/:update?",
    name: "marvinloginsuccess",
    component: () => import("../views/HomeView.vue"),
    props: true,
    meta: {
      title: "Marvin Login Success",
    },
  },
  {
    path: "/marvin/login/failure",
    name: "marvinloginfailure",
    component: () => import("../views/FailedLogin.vue"),
    meta: {
      title: "Marvin Login Failure",
    },
  },
  {
    path: "/profile/:nickname",
    name: "profile",
    component: () => import("../views/ProfileView.vue"),
    props: true,
    meta: {
      title: "Profile",
      needsAuth: true,
    },
  },
  {
    path: "/otp/:mode",
    name: "otp",
    component: () => import("../views/OtpView.vue"),
    props: true,
    meta: {
      title: "Required OTP for 2-Factor Authentication",
    },
  },
  {
    path: "/ranking",
    name: "ranking",
    component: () => import("../views/RankingView.vue"),
    meta: {
      title: "Ranking",
      needsAuth: true,
    },
  },
  {
    path: "/chat/:chan_name/:nickname?",
    name: "Direct chat - channel",
    component: () => import("../views/ChatView.vue"),
    props: true,
    meta: {
      title: "Direct Chat - Channel",
      needsAuth: true,
    },
  },
  {
    path: "/chat/:chan_name",
    name: "chat - channel",
    component: () => import("../views/ChatView.vue"),
    props: true,
    meta: {
      title: "Chat - Channel",
      needsAuth: true,
    },
  },
  {
    path: "/pong/:match_id",
    name: "pong",
    component: () => import("../views/PongView.vue"),
    props: true,
    meta: {
      title: "Pong",
      needsAuth: true,
    },
  },
  {
    path: "/:pathMatch(.*)",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
    meta: {
      title: "404 Not Found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.needsAuth) {
    if (!userStore.auth) {
      next("/");
    } else if (userStore.auth) {
      next();
    }
  } else {
    next();
  }
});

export default router;
