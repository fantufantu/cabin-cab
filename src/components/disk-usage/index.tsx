import { Pie } from "@visx/shape";

const DATA = [
  {
    label: "ALL",
    usage: 80,
  },
  {
    label: "FREE",
    usage: 20,
  },
];

const DiskUsage = () => {
  return (
    <svg width={200} height={200}>
      <Pie
        top={100}
        left={100}
        data={DATA}
        pieValue={({ usage }) => usage}
        outerRadius={40}
        cornerRadius={4}
      />
    </svg>
  );
};

export default DiskUsage;
