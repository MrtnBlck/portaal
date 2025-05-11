export default function Container(props: {
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={props.wrapperClassName}>
      <div
        className={`mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-center px-6 pb-6 ${props.className}`}
      >
        {props.children}
      </div>
    </div>
  );
}
