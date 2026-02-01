export interface Template {
    id: string;
    name: string;
    description: string;
    data: string;
    config: string;
}

export const templates: Template[] = [
    {
        id: 'line-basic',
        name: 'Line Chart',
        description: 'Basic line chart example',
        data: `[
  { "x": 1, "y": 10 },
  { "x": 2, "y": 25 },
  { "x": 3, "y": 18 },
  { "x": 4, "y": 30 },
  { "x": 5, "y": 45 }
]`,
        config: `const data = getData();

const chartConfig = {
  series: {
    data: [
      {
        type: 'line',
        data: data,
        name: 'Series 1'
      }
    ]
  },
  xAxis: {
    type: 'linear',
    title: { text: 'X Axis' }
  },
  yAxis: [
    {
      title: { text: 'Y Axis' }
    }
  ],
  title: {
    text: 'Line Chart Example'
  }
};`,
    },
    {
        id: 'pie-basic',
        name: 'Pie Chart',
        description: 'Basic pie chart example',
        data: `[
  { "name": "Category A", "value": 30 },
  { "name": "Category B", "value": 25 },
  { "name": "Category C", "value": 20 },
  { "name": "Category D", "value": 15 },
  { "name": "Category E", "value": 10 }
]`,
        config: `const data = getData();

const chartConfig = {
  series: {
    data: [
      {
        type: 'pie',
        data: data,
        name: 'Distribution'
      }
    ]
  },
  title: {
    text: 'Pie Chart Example'
  }
};`,
    },
];
