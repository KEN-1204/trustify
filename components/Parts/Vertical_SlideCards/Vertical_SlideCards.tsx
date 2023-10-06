import React, { FC } from "react";

import styles from "./Vertical_SlideCards.module.css";
import Image from "next/image";
// import PersonImages from "@/assets/images/Person_Image";
import Link from "next/link";
import PersonImages from "@/assets/images/Person";

// https://www.youtube.com/watch?v=Gd7T5_3tjYQ&list=PLKF1EjBAtza3tx3x5JoJJEJIfekp1LNbP&index=29&t=20s

const Vertical_SlideCards: FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.img}>
            <Image src={PersonImages.man02} alt="Person" width={50} height={50} />
            {/* <Image src="/assets/images/beautiful/ocean2.jpg" alt="" width={50} height={50} /> */}
          </div>
          <div className={styles.details}>
            {/* <span className={styles.name}>Justin Chung</span> */}
            <span className={styles.name}>Mark Davis</span>
            {/* <span className={styles.name}>マーク デイビス</span> */}
            {/* <p>Backend Developer</p> */}
            <p>Sales Manager</p>
            {/* <p>営業部 マネージャー</p> */}
          </div>
        </div>
        {/* <Link href="#">Follow</Link> */}
        <div className={`${styles.follow_btn}`}>招待</div>
      </div>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.img}>
            <Image src={PersonImages.man01} alt="Person" width={50} height={50} />
            {/* <Image src="/assets/images/beautiful/ocean2.jpg" alt="" width={50} height={50} /> */}
          </div>
          <div className={styles.details}>
            {/* <span className={styles.name}>Sumit Kapoor</span> */}
            {/* <span className={styles.name}>Daichi Miyamoto</span> */}
            <span className={styles.name}>宮本 大地</span>
            <p>フロントエンドエンジニア</p>
          </div>
        </div>
        {/* <Link href="#">Follow</Link> */}
        <div className={`${styles.follow_btn}`}>招待</div>
      </div>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.img}>
            <Image src={PersonImages.woman01} alt="Person" width={50} height={50} />
            {/* <Image src="/assets/images/beautiful/ocean2.jpg" alt="" width={50} height={50} /> */}
          </div>
          <div className={styles.details}>
            {/* <span className={styles.name}>Jasmine Carter</span> */}
            <span className={styles.name}>Jasmine Carter</span>
            <p>Marketing</p>
          </div>
        </div>
        {/* <Link href="#">Follow</Link> */}
        <div className={`${styles.follow_btn}`}>招待</div>
      </div>

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.img}>
            <Image src={PersonImages.man03} alt="Person" width={50} height={50} />
            {/* <Image src="/assets/images/beautiful/ocean2.jpg" alt="" width={50} height={50} /> */}
          </div>
          <div className={styles.details}>
            {/* <span className={styles.name}>Sumit Kapoor</span> */}
            {/* <span className={styles.name}>David Brown</span> */}
            <span className={styles.name}>Sumit Anand</span>
            {/* <span className={styles.name}>デビッド ブラウン</span> */}
            {/* <p>Frontend Developer</p> */}
            <p>Sales</p>
            {/* <p>営業部</p> */}
          </div>
        </div>
        {/* <Link href="#">Follow</Link> */}
        <div className={`${styles.follow_btn}`}>招待</div>
      </div>
      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.img}>
            <Image src={PersonImages.woman03} alt="Person" width={50} height={50} />
            {/* <Image src="/assets/images/beautiful/ocean2.jpg" alt="" width={50} height={50} /> */}
          </div>
          <div className={styles.details}>
            {/* <span className={styles.name}>Sumit Kapoor</span> */}
            <span className={styles.name}>Lisa Scott</span>
            <p>HR</p>
          </div>
        </div>
        {/* <Link href="#">Follow</Link> */}
        <div className={`${styles.follow_btn}`}>招待</div>
      </div>
    </div>
  );
};

export default Vertical_SlideCards;
