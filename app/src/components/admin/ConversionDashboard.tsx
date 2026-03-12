import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, MessageCircle, Mail, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getAdminConversionDashboard,
  type ConversionChannelFilter,
  type ConversionEventRow,
  type ConversionFilters,
  type ConversionKpis,
  type WhatsAppOpenFilter,
} from "@/lib/api/admin-conversion-service";

const DEFAULT_FILTERS: ConversionFilters = {
  dateFrom: "",
  dateTo: "",
  channel: "all",
  whatsappOpenState: "all",
  limit: 100,
};

const EMPTY_KPIS: ConversionKpis = {
  contactRequests: 0,
  whatsappAttempts: 0,
  approxFormVsWhatsAppRate: 0,
};

function getChannelBadgeVariant(channel: ConversionEventRow["channel"]) {
  return channel === "email_form" ? "default" : "secondary";
}

function getStatusLabel(status: string): string {
  if (status === "opened") return "Abierto";
  if (status === "blocked") return "Bloqueado";
  if (status === "new") return "Nuevo";
  return status;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

const ConversionDashboard = () => {
  const [filters, setFilters] = useState<ConversionFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ConversionKpis>(EMPTY_KPIS);
  const [events, setEvents] = useState<ConversionEventRow[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminConversionDashboard(filters);
      setKpis(data.kpis);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar la conversión omnicanal.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const showWhatsappFilter = useMemo(
    () => filters.channel === "all" || filters.channel === "whatsapp_cta",
    [filters.channel],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversión Omnicanal</CardTitle>
          <CardDescription>
            Métricas operativas de solicitudes por formulario y CTA de WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="conv-date-from">Desde</Label>
            <Input
              id="conv-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="conv-date-to">Hasta</Label>
            <Input
              id="conv-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, dateTo: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="conv-channel">Canal</Label>
            <select
              id="conv-channel"
              value={filters.channel}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  channel: event.target.value as ConversionChannelFilter,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="email_form">Formulario Email</option>
              <option value="whatsapp_cta">WhatsApp CTA</option>
            </select>
          </div>
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="conv-whatsapp-state">Estado WhatsApp</Label>
            <select
              id="conv-whatsapp-state"
              value={filters.whatsappOpenState}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  whatsappOpenState: event.target.value as WhatsAppOpenFilter,
                }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={!showWhatsappFilter}
            >
              <option value="all">Todos</option>
              <option value="opened">Abierto</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
          <div className="space-y-1 xl:col-span-1">
            <Label htmlFor="conv-limit">Límite</Label>
            <Input
              id="conv-limit"
              type="number"
              min={10}
              max={500}
              step={10}
              value={filters.limit}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Math.max(10, Math.min(500, Number(event.target.value || 100))),
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Solicitudes por formulario</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {kpis.contactRequests}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Intentos WhatsApp</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {kpis.whatsappAttempts}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasa form/WhatsApp (aprox.)</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {kpis.approxFormVsWhatsAppRate}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de Conversión</CardTitle>
          <CardDescription>
            Mostrando hasta {filters.limit} registros combinados por fecha descendente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void loadData()}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No hay eventos para los filtros seleccionados.
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Contexto</TableHead>
                    <TableHead>Resumen</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((row) => (
                    <TableRow key={`${row.channel}-${row.id}`}>
                      <TableCell className="whitespace-nowrap">{formatDate(row.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={getChannelBadgeVariant(row.channel)}>
                          {row.channel === "email_form" ? "Formulario" : "WhatsApp"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.source}</TableCell>
                      <TableCell>{row.context}</TableCell>
                      <TableCell>{row.summary}</TableCell>
                      <TableCell>{getStatusLabel(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionDashboard;
