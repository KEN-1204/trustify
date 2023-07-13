import styles from "./assets.module.css";

export const googleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

export const animatedSettingIcon = (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    className={`${styles.rotate_animate} `}
  >
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path
        // stroke="#0A0A30"
        stroke="var(--color-icon)"
        d="M5.262 15.329l.486.842a1.49 1.49 0 002.035.55 1.486 1.486 0 012.036.529c.128.216.197.463.2.714a1.493 1.493 0 001.493 1.536h.979a1.486 1.486 0 001.485-1.493 1.493 1.493 0 011.493-1.471c.252.002.498.071.714.2a1.493 1.493 0 002.036-.55l.521-.857a1.493 1.493 0 00-.542-2.036 1.493 1.493 0 010-2.586c.71-.41.952-1.318.543-2.028l-.493-.85a1.493 1.493 0 00-2.036-.579 1.479 1.479 0 01-2.029-.543 1.428 1.428 0 01-.2-.714c0-.825-.668-1.493-1.492-1.493h-.98c-.82 0-1.488.664-1.492 1.486a1.485 1.485 0 01-1.493 1.493 1.521 1.521 0 01-.714-.2 1.493 1.493 0 00-2.036.542l-.514.858a1.486 1.486 0 00.543 2.035 1.486 1.486 0 01.543 2.036c-.13.226-.317.413-.543.543a1.493 1.493 0 00-.543 2.028v.008z"
        clipRule="evenodd"
      />
      <path stroke="var(--color-bg-brand-f)" d="M12.044 10.147a1.853 1.853 0 100 3.706 1.853 1.853 0 000-3.706z" />
      {/* <path stroke="#265BFF" d="M12.044 10.147a1.853 1.853 0 100 3.706 1.853 1.853 0 000-3.706z" /> */}
    </g>
  </svg>
);

export const animatedMailIcon = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
    <rect width="12" height="10" x="6" y="8.804" stroke="var(--color-icon)" strokeWidth="1.5" rx="2" />
    <path
      fill="#fff"
      // stroke="#265BFF"
      stroke="var(--color-bg-brand-f)"
      strokeWidth="1.5"
      d="M9 6.196a1 1 0 011-1h4a1 1 0 011 1v5.082a1 1 0 01-.37.777l-2.006 1.628a1 1 0 01-1.263-.002l-1.993-1.626A1 1 0 019 11.28V6.196z"
      className={`${styles.mail_icon} `}
      // style="animation:open 2s cubic-bezier(.49,.39,.35,1.06) both infinite"
    />
    <path
      stroke="var(--color-icon)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8.465 11.413l3.573 2.783 3.497-2.783"
    />
  </svg>
);

export const a = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
    <rect width="12" height="10" x="6" y="8.804" stroke="#0A0A30" strokeWidth="1.5" rx="2" />
    <path
      fill="#fff"
      stroke="#265BFF"
      strokeWidth="1.5"
      d="M9 6.196a1 1 0 011-1h4a1 1 0 011 1v5.082a1 1 0 01-.37.777l-2.006 1.628a1 1 0 01-1.263-.002l-1.993-1.626A1 1 0 019 11.28V6.196z"
    />
    <path
      stroke="#0A0A30"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8.465 11.413l3.573 2.783 3.497-2.783"
    />
  </svg>
);

export const animatedSendIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24">
    <g className={`${styles.send}`}>
      <path stroke="var(--color-bg-brand-f)" stroke-linecap="round" stroke-width="1.5" d="M9.407 14.593l3.058-3.058" />
      <path
        stroke="var(--color-icon)"
        stroke-width="1.5"
        d="M15.564 7.908a.432.432 0 01.528.528l-2.677 10.175a.432.432 0 01-.724.195L5.194 11.31a.432.432 0 01.195-.724l10.175-2.677z"
      />
    </g>
  </svg>
);

export const animatedSearchIcon = (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    className={`${styles.search_icon} `}
  >
    <style></style>
    <g>
      <path
        fill="var(--color-icon)"
        fillRule="evenodd"
        d="M5.71 11.025a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0zm5.25-7a7 7 0 100 14 7 7 0 000-14z"
        clipRule="evenodd"
      />
      <rect
        width="1.839"
        height="3.677"
        x="16.139"
        y="17.375"
        fill="var(--color-bg-brand-f)"
        rx=".2"
        transform="rotate(-45 16.14 17.375)"
      />
    </g>
  </svg>
);

export const animatedTrendingIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24">
    <rect width="16" height="16" x="4" y="4" stroke="var(--color-icon)" strokeWidth="1.5" rx="2.075" />
    <path
      // class="trending"
      stroke="var(--color-bg-brand-f)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M7.5 15l2.658-4.5 3.158 3.5L16.5 9"
      className={styles.trending}
    />
  </svg>
);

export const animatedChartIcon = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
    <style></style>
    <path
      stroke="var(--color-icon)"
      strokeWidth="1.5"
      d="M17.82 16.889a7 7 0 001.162-3.39A.473.473 0 0018.5 13h-6a.5.5 0 01-.5-.5v-6a.473.473 0 00-.5-.482 7 7 0 106.32 10.871z"
    />
    <path
      stroke="var(--color-bg-brand-f)"
      strokeWidth="1.5"
      d="M19 11c.552 0 1.009-.45.917-.995a6 6 0 00-4.922-4.922C14.451 4.992 14 5.448 14 6v4a1 1 0 001 1h4z"
      // style="animation:slide-tr 1s cubic-bezier(.47,0,.745,.715) infinite alternate-reverse both"
      className={styles.chart_icon}
    />
  </svg>
);

export const animatedCycleIcon = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
    <g className={styles.cycle_icon} stroke-width="1.5">
      <path
        stroke="var(--color-icon)"
        stroke-linecap="round"
        d="M6.883 11.778a5 5 0 018.473-3.597m1.761 4.131a5 5 0 01-8.473 3.597"
      />
      <path
        fill="var(--color-bg-brand-f)"
        stroke="var(--color-bg-brand-f)"
        d="M17.078 10.145l-2.308-.347a.066.066 0 01-.018-.005.026.026 0 01-.007-.005.056.056 0 01-.015-.024.056.056 0 01-.002-.03l.003-.007a.069.069 0 01.012-.015l1.995-1.964a.064.064 0 01.015-.012.028.028 0 01.007-.003.056.056 0 01.029.003c.012.004.02.01.024.015a.03.03 0 01.005.007.069.069 0 01.004.019l.313 2.312a.046.046 0 01-.015.042.045.045 0 01-.043.014zm-10.156 3.8l2.308.348.018.005a.03.03 0 01.007.005c.004.003.01.011.015.024a.056.056 0 01.002.029.027.027 0 01-.003.007.065.065 0 01-.012.015l-1.995 1.965a.072.072 0 01-.015.012.03.03 0 01-.007.003.056.056 0 01-.029-.003.057.057 0 01-.024-.016.028.028 0 01-.005-.006.066.066 0 01-.004-.019l-.313-2.312a.046.046 0 01.002-.023.053.053 0 01.013-.02.052.052 0 01.02-.012.046.046 0 01.022-.002z"
      />
    </g>
  </svg>
);
