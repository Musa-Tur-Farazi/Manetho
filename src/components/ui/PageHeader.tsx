import { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  backgroundImage?: string;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  children,
  backgroundImage,
}) => {
  return (
    <div className="relative mb-16">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10 rounded-xl"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="relative z-10 py-16 px-6 text-center rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader; 