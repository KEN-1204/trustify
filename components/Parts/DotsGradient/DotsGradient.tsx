type Props = {
  withFade?: boolean;
};

export const DotsGradient = ({ withFade = true }: Props) => {
  return (
    <>
      <div className={`fixed inset-0 z-[0] ${withFade ? `fade03` : ``}`}>
        <div className="bg-gradient-brand4 z-1 absolute bottom-[-300px] left-[-400px] h-[500px] w-[500px] rounded-full"></div>
        <div className="bg-gradient-brand2 z-1 absolute left-[48%] top-[-900px] h-[1120px] w-[1120px] rounded-full"></div>
        {/* <div className="bg-gradient-brand-vivid-blue z-1 absolute left-[-40%] top-[-900px] h-[1120px] w-[1120px] rounded-full"></div> */}
        <div className="bg-gradient-brand-white z-1 absolute bottom-[-200px] right-[-100px] h-[300px] w-[300px] rounded-full"></div>
      </div>
    </>
  );
};
