
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

interface NoDataMessageProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
  onActionClick?: () => void;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({
  title,
  description,
  actionText,
  actionLink,
  icon,
  onActionClick
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {icon || <SearchX className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      
      {actionText && actionLink && (
        <Link to={actionLink}>
          <Button>{actionText}</Button>
        </Link>
      )}
      
      {actionText && onActionClick && (
        <Button onClick={onActionClick}>{actionText}</Button>
      )}
    </div>
  );
};

export default NoDataMessage;
