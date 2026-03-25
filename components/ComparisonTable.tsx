import { COMPARISON_TABLE } from '@/lib/constants';

export default function ComparisonTable() {
  return (
    <div className="w-full overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <thead>
          <tr>
            {COMPARISON_TABLE.headers.map((header, i) => (
              <th
                key={i}
                className={`text-left px-4 py-3 font-semibold border-b-2 ${
                  i === 3
                    ? 'bg-gold-lt text-navy border-b-gold'
                    : 'text-gray border-b-light'
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_TABLE.rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? 'bg-white' : 'bg-pale'}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 border-b border-light ${
                    j === 0
                      ? 'font-medium text-navy'
                      : j === 3
                      ? 'font-medium text-navy bg-gold-lt/50'
                      : 'text-gray'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
