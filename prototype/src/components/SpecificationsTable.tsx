import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpecificationsTableProps {
  description: string;
}

// Parse description into structured specifications
function parseSpecifications(description: string): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [];
  
  // Add full description as main spec
  specs.push({
    label: "Descripción Completa",
    value: description,
  });

  // Extract common patterns
  const patterns = [
    { regex: /TALLA\s+(\d+|[A-Z]+|\d+\.\d+)/i, label: "Talla" },
    { regex: /MODELO[:\s]+([A-Z0-9-]+)/i, label: "Modelo" },
    { regex: /No\.\s*(\d+)/i, label: "Número" },
    { regex: /CLASE\s+([A-Z])/i, label: "Clase" },
    { regex: /TIPO\s+([IV]+|\d+|[A-Z\s]+)/i, label: "Tipo" },
    { regex: /COLOR\s+([A-Z\s]+?)(?=[,.]|CON|MCA|MODELO|TALLA|$)/i, label: "Color" },
    { regex: /MCA\.\s*([A-Z\s]+?)(?=[,.]|COLOR|MODELO|TALLA|$)/i, label: "Marca" },
    { regex: /(\d+%)\s*([A-Z]+)/i, label: "Material" },
  ];

  patterns.forEach(({ regex, label }) => {
    const match = description.match(regex);
    if (match && match[1]) {
      specs.push({
        label,
        value: match[1].trim(),
      });
    }
  });

  // Check for certifications
  if (description.includes("ISO")) {
    const isoMatches = description.match(/ISO\s+[\d:]+/g);
    if (isoMatches) {
      specs.push({
        label: "Certificaciones",
        value: isoMatches.join(", "),
      });
    }
  }

  // Check for safety standards
  if (description.includes("NRF")) {
    const nrfMatch = description.match(/NRF-[\d-A-Z]+/);
    if (nrfMatch) {
      specs.push({
        label: "Norma",
        value: nrfMatch[0],
      });
    }
  }

  return specs;
}

const SpecificationsTable = ({ description }: SpecificationsTableProps) => {
  const specifications = parseSpecifications(description);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especificaciones Técnicas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Característica</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specifications.map((spec, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{spec.label}</TableCell>
                <TableCell className="text-muted-foreground">{spec.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SpecificationsTable;
