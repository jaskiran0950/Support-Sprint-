import React from "react";
import styles from "@/styles/dashboard.module.css";

const DashboardCard = ({ title, count, subText, subTexts }) => (
  <div className={styles.dashboardCard}>
    <div className={styles.cardHeader}>
      <h4>
        <strong> {title}</strong>
      </h4>
    </div>
    <p className={styles.cardCount}>
      <strong>{count}</strong>
    </p>
    {subText && <small className={styles.subText}>{subText}</small>}
    {subTexts &&
      subTexts.map((text, index) => (
        <small key={index} className={styles.subText}>
          {text}
        </small>
      ))}
  </div>
);

export default DashboardCard;
