import React from "react";
import Link from "next/link";
import styles from "./layout.module.css";
import { UserRoles } from "@/utils/constants";
import { getSession, useSession } from "next-auth/react";

const secret = process.env.NEXT_PUBLIC_SECRET;

const Navbar = () => {
  const { data: session } = useSession();
  const role = session?.user.role;

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarNav}>
        {role && (
          <>
            <li className={styles.navItem}>
              <Link href="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
            </li>
            {role === UserRoles.Support && (
              <>
                <li className={styles.navItem}>
                  <Link href="/kanban" className={styles.navLink}>
                    KanBan Board
                  </Link>
                </li>
              </>
            )}
            {role !== UserRoles.SuperAdmin && (
              <>
                <li className={styles.navItem}>
                  <Link href="/ticket/list" className={styles.navLink}>
                    Tickets
                  </Link>
                </li>
              </>
            )}
            {role === UserRoles.Admin && (
              <>
                <li className={styles.navItem}>
                  <Link href="/user" className={styles.navLink}>
                    Users
                  </Link>
                </li>
              </>
            )}
            {role === UserRoles.Admin && (
              <>
                <li className={styles.navItem}>
                  <Link href="/tags" className={styles.navLink}>
                    Tags
                  </Link>
                </li>
              </>
            )}
            {role === UserRoles.SuperAdmin && (
              <>
                <li className={styles.navItem}>
                  <Link href="/contact-request" className={styles.navLink}>
                    Contact Requests
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/organization" className={styles.navLink}>
                    Organizations
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/admin" className={styles.navLink}>
                    Admins
                  </Link>
                </li>
              </>
            )}
            {role !== UserRoles.SuperAdmin && (
              <>
                <li className={styles.navItem}>
                  <Link href="/faqs" className={styles.navLink}>
                    FAQs
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
}

export default Navbar;
