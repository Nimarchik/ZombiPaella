import { animated, useTransition } from "@react-spring/web";
import { Outlet, useLocation } from "react-router-dom";
import style from './styles/index.module.css'
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

const App = () => {
  const location = useLocation();

  const transitions =
    useTransition(location, {
      from: {
        opacity: 0,
        transform:
          "translateY(100%)",
        position: "relative",
        flexGrow: 1,
      },

      enter: {
        opacity: 1,
        transform:
          "translateY(0)",
        flexGrow: 1,
      },
    });

  return (<>

    <div className={style.wrapper}>
      {/* <Header /> */}
      <main className={style.main}>
        {transitions(
          (styles, location) => (
            <animated.div
              className={
                style.animated
              }
              style={styles}
            >
              
                <Outlet
                  location={
                    location
                  }
                />
            </animated.div>
          )
        )}
      </main>
      {/* <Footer /> */}
    </div>
  </>);
};

export default App;