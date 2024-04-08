import logo from '@/assets/logo.png';

export function FileNotSelected() {
  return (
    <div className="flex flex-1 justify-center items-center h-full">
      <img src={logo} alt="logo" className="w-40 h-40" />
    </div>
  );
}
