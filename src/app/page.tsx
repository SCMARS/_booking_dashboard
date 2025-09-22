export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-heading mb-4 md:mb-6">Welcome to AI Bot Admin</h1>
        <p className="text-sm md:text-base text-gray-600 mb-6">
          Выберите раздел в меню слева для начала работы.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-medium mb-2 text-blue-800">Quick Start</h2>
            <p className="text-sm text-blue-700">
              Check the dashboard for an overview of your restaurant's performance.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="text-lg font-medium mb-2 text-green-800">Need Help?</h2>
            <p className="text-sm text-green-700">
              Visit the knowledge base for guides and tutorials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
