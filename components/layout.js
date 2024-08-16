import React, { Suspense } from "react";
import Header from "./header";
import Navbar from "./navbar";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";
  const isIndexPage = router.pathname === "/";
  const isForgetPasswordPage = router.pathname === "/forgot-password";
  const isResetPasswordPage = router.pathname === "/reset-password";

  return (
    <div>
      {!isLoginPage &&
        !isIndexPage &&
        !isForgetPasswordPage &&
        !isResetPasswordPage && (
          <>
            <Header />
            <Navbar />
          </>
        )}

      <div>{children}</div>
    </div>
  );
};

export default Layout;
