/* eslint-disable max-len */
import { AlignJustify } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import logo from '../../assets/images/logo.svg';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { HamburgerMenu } from './HamburgerMenu';
import { NavbarMenu } from './NavbarMenu';

export const Navbar: React.FC = () => {
  const { locale } = useRouter();
  const demoTitle = locale === 'ja' ? 'デモ' : 'Demo';
  const signUpTitle = locale === 'ja' ? '無料ではじめる' : 'Try for free';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      document.documentElement.classList.add('menuOpen');
    } else {
      setIsMenuOpen(false);
      document.documentElement.classList.remove('menuOpen');
    }
  };

  return (
    <div className="sticky top-0 z-20 flex bg-black text-white py-4 pl-5 lg:pl-8 2xl:pl-14 pr-4 md:pr-6 border-b-neutral-400 border-b-[0.5px]">
      <div className="rayContainer">
        <div className="lightRay" />
      </div>
      <div className="flex flex-row items-center gap-12 flex-grow">
        <Link href="/">
          <Image src={logo} alt="logo" className="w-36 logo" />
        </Link>
        <div className="hidden sm:flex flex-row items-center gap-12">
          <NavbarMenu
            href="https://app.collectionscms.com/admin/auth/login"
            title={signUpTitle}
            variant="primary"
          />
        </div>
      </div>
      <div className="hidden sm:block">
        <LanguageSwitcher />
      </div>
      <HamburgerMenu open={isMenuOpen} close={toggleMenu} />
      <div className="sm:hidden flex items-center">
        <button onClick={toggleMenu} className="focus:outline-none">
          <AlignJustify size={28} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
