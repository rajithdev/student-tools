import { classesNeeded } from "@/lib/calc/attendance";

const TOTALS = [20, 30, 40, 50, 60, 72, 80, 90, 100, 120];
const THRESHOLDS = [75, 80, 85, 90];

/** Static table: minimum classes to attend out of N for each threshold (ceil), and max misses. Rendered at build time. */
export function ReadyReckoner() {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Minimum classes to attend and maximum misses by total classes and threshold</caption>
        <thead>
          <tr>
            <th scope="col">Total classes</th>
            {THRESHOLDS.map((t) => (
              <th key={t} scope="col">
                {t}%: attend / can miss
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TOTALS.map((n) => (
            <tr key={n}>
              <th scope="row">{n}</th>
              {THRESHOLDS.map((t) => {
                // minimum attended a such that a/n >= t%  → smallest a with a*100 >= t*n
                const need = Math.ceil((t * n) / 100 - 1e-9);
                return (
                  <td key={t}>
                    {need} / {n - need}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs">
        Example: in a 60-class course, 45 classes keep you at 75%, so you can miss 15 across the term. To check a specific situation (classes already missed, classes still left), use the calculator above. Need-to-attend for a partial term, e.g. 30 of 45 at 75%: {classesNeeded(30, 45, 75)} consecutive classes.
      </p>
    </div>
  );
}
