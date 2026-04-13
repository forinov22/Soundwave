interface ContentProps {
  gradientColor: string;
  children: React.ReactNode;
}

const Content = ({ gradientColor, children }: ContentProps) => {
  return (
    <div
      style={{
        // Используем переменную для плавного перехода, если добавишь transition в CSS
        background: `linear-gradient(to bottom, ${gradientColor} 0%, #121212 400px, #121212 100%)`,
      }}
      className="flex-1 rounded-xl border border-zinc-800/50 overflow-y-auto relative scroll-smooth shadow-inner text-white"
    >
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Content;
