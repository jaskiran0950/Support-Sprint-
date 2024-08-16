import "@/styles/globals.css";
import "@/styles/login.css";
import "@/public/assets/vendor/bootstrap/css/bootstrap.min.css";
import "@/public/assets/vendor/bootstrap-icons/bootstrap-icons.css";
import "@/public/assets/vendor/aos/aos.css";
import "@/public/assets/vendor/swiper/swiper-bundle.min.css";
import "@/public/assets/css/main.css";
import Layout from "../components/layout";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import Loader from "@/components/loader";
import useGlobalLoader from "@/pages/hooks/useGlobalLoader";

export default function App({ Component, pageProps }) {
  const loading = useGlobalLoader();

  return (
    <SessionProvider>
      {loading && <Loader />}
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Layout>
    </SessionProvider>
  );
}
