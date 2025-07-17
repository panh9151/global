import { Outlet } from "react-router-dom";
import style from "./RootLayout.module.scss";
import Menu from "../../components/Menu";

const RootLayout = () => {
  return (
    <div className={style.rootLayout}>
      <Menu></Menu>
      <div className={style.mainContain}>
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default RootLayout;
