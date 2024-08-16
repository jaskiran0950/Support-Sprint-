import React, { useState, useEffect } from "react";
import styles from "./layout.module.css";
import logo from "../public/assets/images/logo2.jpg";
import Image from "next/image";
import { getSession, signOut } from "next-auth/react";
import "bootstrap/dist/css/bootstrap.css";
import Dropdown from "react-bootstrap/Dropdown";
import profile from "../public/assets/images/profile.jpg";
import { useRouter } from "next/router";

const Header = () => {
  const [userName, setUserName] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.success) {
          setUserName(data.user.name);
          setOrganizationId(data.user.organization.name);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const CustomToggle = React.forwardRef(({ onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      <Image
        src={profile}
        alt="Profile"
        width="40"
        height="42"
        style={{ borderRadius: "50%" }}
      />
      <div style={{ marginLeft: "10px", color: "white" }}>
        {userName && <div>{userName}</div>}
        {organizationId && (
          <div style={{ fontSize: "0.7em" }}> {organizationId}</div>
        )}
      </div>
    </div>
  ));

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src={logo} alt="Logo" height="52" />
      </div>
      <div style={{ display: "block", padding: "0.8rem" }}>
        <Dropdown>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleProfileClick}>Profile</Dropdown.Item>{" "}
            <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
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

export default Header;
