import { Code2, Facebook, Linkedin, Mail, Instagram } from "lucide-react";
import logo_forum from "../../assets/logo_forum.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background py-12 text-white/70">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={logo_forum} alt="Logo Forum" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Programming Forum - A place to share knowledge, connect the
              developer community, and grow together."
            </p>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-foreground">
              Our Services
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-white transition-colors cursor-pointer">
                Coding challenges
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Ask AI, Get Answers
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Share & Learn Knowledge
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Connect With Developers
              </li>
            </ul>
          </div>

          {/* Our Resources */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-foreground">
              Our Resources
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-white transition-colors cursor-pointer">
                Documentation & Guides
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Community Guidelines
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                FAQ & Support
              </li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-foreground">
              About Us
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Nguyễn Quý Phong</li>
              <li>Dương Quốc Thuận</li>
            </ul>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 hover:bg-blue-700"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 hover:bg-Facebok"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://mail.google.com/"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 hover:bg-Gmail"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 hover:bg-linear-(--gradient-Instagram)"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
