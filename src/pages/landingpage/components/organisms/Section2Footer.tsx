// src/pages/landingpage/components/organisms/Section2Footer.tsx
import { WorkflowPot } from "../molecules/WorkflowPot";
// Import ikon placeholder dari lucide-react
import { UserPlus, Settings, Database, ClipboardList } from "lucide-react";

// Data untuk 4 pot
const potData = [
  {
    icon: UserPlus,
    // DIPERBARUI: 'iconClassName' dihapus
    title: "Sign up and customize",
    description:
      "Create your account in minutes and tailor the platform to meet your company's unique needs.",
    imageSrc: "/src/assets/images/landing/illustrations/singupilustaration.svg",
  },
  {
    icon: Settings,
    // DIPERBARUI: 'iconClassName' dihapus
    title: "Integrate your tools",
    description:
      "Connect seamlessly with your existing software stack, from accounting to project management.",
    imageSrc: "/src/assets/images/landing/illustrations/linkuraccount.svg",
  },
  {
    icon: ClipboardList,
    // DIPERBARUI: 'iconClassName' dihapus
    title: "Manage tasks efficiently",
    description:
      "Assign, track, and complete projects with our intuitive task management interface.",
    imageSrc:
      "/src/assets/images/landing/illustrations/startmanagingefficiently.svg",
  },
  {
    icon: Database,
    // DIPERBARUI: 'iconClassName' dihapus
    title: "Analyze your data",
    description:
      "Gain valuable insights with powerful, real-time analytics and customizable reports.",
    imageSrc: "/src/assets/images/landing/illustrations/integratedata.svg",
  },
];

/**
 * Komponen Section 2 Footer
 * Merender 4 pot workflow dalam 2 baris.
 */
export function Section2Footer() {
  return (
    // Container Section2Footer
    <div
      className="
        flex w-full flex-col items-center 
        gap-4 lg:gap-[23.309px]
        lg:w-auto
      "
    >
      {/* Frame 22 (Baris 1) */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-4 lg:gap-[23.309px] 
          lg:flex-row lg:justify-between
        "
      >
        <WorkflowPot {...potData[0]} />
        <WorkflowPot {...potData[1]} />
      </div>

      {/* Frame 21 (Baris 2) */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-4 lg:gap-[23.309px] 
          lg:flex-row lg:justify-between
        "
      >
        <WorkflowPot {...potData[2]} />
        <WorkflowPot {...potData[3]} />
      </div>
    </div>
  );
}
