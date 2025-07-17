import { useEffect } from "react";
import styles from "./Menu.module.scss";
import axios from "../../Axios";
import { ReactSVG } from "react-svg";
import { NavLink } from "react-router-dom";

const Menu = () => {
  /* Lấy thử dữ liệu – giữ nguyên */
  useEffect(() => {
    axios.get("words").then((a) => console.log(a.data));
    axios.get("topics").then((a) => console.log(a.data));
    axios.get("groups").then((a) => console.log(a.data));
  }, []);

  /** Hàm dựng class cho NavLink */
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.item} ${isActive ? styles.active : ""}`;

  return (
    <div className={styles.menu}>
      <div>
        <h1 className={styles.heading}>Menu</h1>

        {/* Search */}
        <form className={styles.search}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
          />
        </form>

        {/* TASKS */}
        <h2 className={styles.subHeading}>Tasks</h2>
        <ul className={styles.nav}>
          <li>
            <NavLink to="/upcoming" className={getLinkClass}>
              <i className={styles.icon}>
                <ReactSVG src="/img/arrow1.svg" />
              </i>
              Upcoming
            </NavLink>
          </li>
          <li>
            <NavLink to="/today" className={getLinkClass}>
              <i className={styles.icon}>
                <ReactSVG src="/img/check1.svg" />
              </i>
              Today
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar" className={getLinkClass}>
              <i className={styles.icon}>
                <ReactSVG src="/img/calendar1.svg" />
              </i>
              Calendar
            </NavLink>
          </li>
          <li>
            <NavLink to="/sticky-wall" className={getLinkClass}>
              <i className={styles.icon}>
                <ReactSVG src="/img/note1.svg" />
              </i>
              Sticky Wall
            </NavLink>
          </li>
        </ul>

        {/* LISTS */}
        <h2 className={styles.subHeading}>Lists</h2>
        <ul className={styles.nav}>
          <li>
            <NavLink to="/list/personal" className={getLinkClass}>
              <i
                className={styles.colorBox}
                style={{ "--color": "#9BFF4D" } as any}
              />
              Personal
            </NavLink>
          </li>
          <li>
            <NavLink to="/list/work" className={getLinkClass}>
              <i
                className={styles.colorBox}
                style={{ "--color": "#FFC94D" } as any}
              />
              Work
            </NavLink>
          </li>
          <li>
            <NavLink to="/list/study" className={getLinkClass}>
              <i
                className={styles.colorBox}
                style={{ "--color": "#4DD2FF" } as any}
              />
              Study
            </NavLink>
          </li>
        </ul>
      </div>
      <div />
    </div>
  );
};

export default Menu;
