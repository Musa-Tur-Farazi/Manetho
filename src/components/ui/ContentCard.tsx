import { FC, ReactNode } from 'react';
import { Button } from './Button';
import Link from 'next/link';

interface ContentCardProps {
  title: string;
  description: string;
  image?: string;
  icon?: ReactNode;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

const ContentCard: FC<ContentCardProps> = ({
  title,
  description,
  image,
  icon,
  buttonText,
  buttonLink,
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {image && (
        <div className="h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center mb-4">
          {icon && <div className="text-cyan-600 dark:text-cyan-400 mr-3">{icon}</div>}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        {buttonText && buttonLink && (
          <Link href={buttonLink}>
            <Button variant="outline" className="w-full justify-center">
              {buttonText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ContentCard; 