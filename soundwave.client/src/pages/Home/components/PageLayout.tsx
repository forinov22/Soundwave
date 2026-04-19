interface ContentProps {
  gradientColor: string;
  children: React.ReactNode;
}

const PageLayout = ({ gradientColor, children }: ContentProps) => {
  return (
    <div
      style={{
        // Используем переменную для плавного перехода, если добавишь transition в CSS
        background: `linear-gradient(to bottom, ${gradientColor} 0%, #121212 400px, #121212 100%)`,
      }}
      className="relative flex-1 overflow-y-auto scroll-smooth rounded-xl border border-zinc-800/50 text-white shadow-inner"
    >
      <div className="p-6">{children}</div>
    </div>
  );
};

export default PageLayout;
