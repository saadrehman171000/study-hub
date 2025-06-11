import { BarChart, Book } from 'lucide-react';

type StudyTimeBySubjectProps = {
  data: Record<string, number>;
};

export function StudyTimeBySubject({ data }: StudyTimeBySubjectProps) {
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Convert object to array and sort by study time (descending)
  const sortedData = Object.entries(data)
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  // Get the maximum value for calculating relative bar widths
  const maxMinutes = sortedData.length > 0 
    ? sortedData[0].minutes 
    : 0;

  return (
    <div className="bg-white dark:bg-dark-100 p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
          Study Time by Subject
        </h2>
      </div>

      {sortedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <Book className="h-12 w-12 mb-3 opacity-50" />
          <p>No study time data available</p>
          <p className="text-sm mt-2">Start a study session to track your time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedData.map(({ subject, minutes }) => (
            <div key={subject} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {subject}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatMinutes(minutes)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${(minutes / maxMinutes) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 