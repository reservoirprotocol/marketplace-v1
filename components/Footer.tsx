import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="mx-auto grid max-w-[2560px] grid-cols-4 gap-x-4 pb-4 px-6 md:px-16">
      <div className="col-span-full">
        <div className="border-t-2 border-t-gray-200 py-4">
        </div>
      </div>
      <div className="col-span-2 text-xs">© 2022 SHOWROOM</div>
      <div className="col-span-2 text-right">
        <Link href="/privacy-policy"><span className="text-xs cursor-pointer">Privacy Policy</span></Link>
        <br />
        <Link href="/terms-of-service"><span className="text-xs cursor-pointer">Terms of Service</span></Link>
      </div>
    </footer>
  );
}

export default Footer;
