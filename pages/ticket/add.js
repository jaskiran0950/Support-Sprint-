import React, { useEffect, useState } from "react";
import Multiselect from "multiselect-react-dropdown";
import styles from "./tickets.module.css";
import { Status } from "@/utils/constants";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

export default function Ticket() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState([]);
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        } else {
          console.error("Failed to fetch tags");
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const convertTagsToString = (tagsArray) => {
    return tagsArray.map((tag) => tag.name).join(", ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tagsString = convertTagsToString(category);

    const payload = {
      title: title,
      description: description,
      tags: tagsString,
      message: message,
      status: Status.New,
      reopen: 0,
    };

    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Ticket submitted successfully");
        toast.success("Ticket submitted successfully");
        router.push("/ticket/list");
      } else {
        console.error("Failed to submit ticket");
        toast.error("Failed to submit ticket");
      }
    } catch (error) {
      toast.error("Error submitting ticket");
      console.error("Error submitting ticket:", error);
    }

    setTitle("");
    setDescription("");
    setCategory([]);
    setMessage("");
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className={styles.ticket_container}>
      <form onSubmit={handleSubmit} className={styles.ticket_form}>
        <h4 className={styles.heading}>Create New Ticket</h4>
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div>
          <label className="form-label">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group ">
          <label className="form-label">Category / Tags:</label>
          <Multiselect
            options={tags}
            selectedValues={category}
            onSelect={(selectedList) => setCategory(selectedList)}
            onRemove={(selectedList) => setCategory(selectedList)}
            displayValue="name"
            style={{ multiselectContainer: { background: "white" } }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className={styles.button_container}>
          <button type="submit" className={styles.ticket_btn}>
            Submit
          </button>
          <button
            type="button"
            className={styles.cancle_btn}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

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