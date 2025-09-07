import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Trophy,
  User,
  FileText,
  RefreshCw,
  X
} from "lucide-react";

// Types for the RPC returns
type AdminWinnerMin = {
  winner_id: number
  winner_created_at: string
  raffle_id: string
  raffle_title: string
  raffle_image_url: string | null
  raffle_status: string
  raffle_draw_date: string | null
  concurso_number: string | null
  federal_draw_date: string | null
  federal_pairs: string | null
  federal_target: string | null
  winning_ticket: string | null
  winner_user_id: string
  winner_handle_fallback: string
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  buyer_cpf: string | null
  organizer_user_id: string | null
  link_raffle_id: string
  link_ticket_id: string | null
  link_winner_user_id: string
}

type AdminWinnerFull = AdminWinnerMin // same shape for now (core/v2)

type Filters = {
  search: string;
  raffleId: string;
  winnerUserId: string;
  organizerUserId: string;
  dateFrom: string;
  dateTo: string;
};

const INITIAL_FILTERS: Filters = {
  search: '',
  raffleId: '',
  winnerUserId: '',
  organizerUserId: '',
  dateFrom: '',
  dateTo: ''
};

const PAGE_SIZES = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 20;

// Utility functions
const digitsOnly = (s?: string | null) => (s ?? '').replace(/\D/g, '');

const formatBrazilianDate = (dateStr: string | null, includeTime = false) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    ...(includeTime 
      ? { dateStyle: 'short', timeStyle: 'short' }
      : { dateStyle: 'short' }
    )
  };
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'há poucos minutos';
  if (diffInHours < 24) return `há ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `há ${diffInDays} dias`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `há ${diffInMonths} meses`;
};

const copyContactsToClipboard = (winner: AdminWinnerMin) => {
  const text = `Nome: ${winner.buyer_name ?? '—'}
Tel: ${winner.buyer_phone ?? '—'}
CPF: ${winner.buyer_cpf ?? '—'}
Email: ${winner.buyer_email ?? '—'}`;
  
  navigator.clipboard.writeText(text);
};

const getWhatsAppUrl = (phone?: string | null) => {
  if (!phone) return null;
  const digits = digitsOnly(phone);
  return `https://wa.me/55${digits}`;
};

export default function AdminGanhadores() {
  const { toast } = useToast();
  
  // State management
  const [winners, setWinners] = useState<AdminWinnerMin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countLoading, setCountLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedWinner, setSelectedWinner] = useState<AdminWinnerMin | null>(null);
  const [selectedWinnerDetail, setSelectedWinnerDetail] = useState<AdminWinnerFull | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce filters (especially search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1); // Reset to first page when filters change
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Load winners count
  const loadCount = useCallback(async (filterValues: Filters) => {
    setCountLoading(true);
    try {
      const { data: totalArr, error } = await supabase
        .rpc('get_admin_winners_min_count', {
          p_search: filterValues.search || null,
          p_raffle_id: filterValues.raffleId || null,
          p_winner_user_id: filterValues.winnerUserId || null,
          p_organizer_user_id: filterValues.organizerUserId || null,
          p_from: filterValues.dateFrom || null,
          p_to: filterValues.dateTo || null,
        })
        .returns<number[]>();

      if (error) throw error;
      
      // Handle both array and scalar returns
      const total = Array.isArray(totalArr) ? totalArr[0] ?? 0 : (totalArr as unknown as number) ?? 0;
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading count:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a contagem de ganhadores.",
        variant: "destructive",
      });
    } finally {
      setCountLoading(false);
    }
  }, [toast]);

  // Load winners list
  const loadWinners = useCallback(async (page: number, size: number, filterValues: Filters) => {
    setLoading(true);
    try {
      const offset = (page - 1) * size;
      
      const { data: rows, error } = await supabase
        .rpc('get_admin_winners_min', {
          p_limit: size,
          p_offset: offset,
          p_search: filterValues.search || null,
          p_raffle_id: filterValues.raffleId || null,
          p_winner_user_id: filterValues.winnerUserId || null,
          p_organizer_user_id: filterValues.organizerUserId || null,
          p_from: filterValues.dateFrom || null,
          p_to: filterValues.dateTo || null,
        })
        .returns<AdminWinnerMin[]>();

      if (error) throw error;
      setWinners(rows || []);
    } catch (error) {
      console.error('Error loading winners:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os ganhadores.",
        variant: "destructive",
      });
      setWinners([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load winner detail
  const loadWinnerDetail = useCallback(async (raffleId: string) => {
    setDetailLoading(true);
    try {
      const { data: detailArr, error } = await supabase
        .rpc('get_admin_winner_detail', { p_raffle_id: raffleId })
        .returns<AdminWinnerFull[]>();

      if (error) throw error;
      
      const detail = Array.isArray(detailArr) ? detailArr[0] ?? null : (detailArr as unknown as AdminWinnerFull | null);
      setSelectedWinnerDetail(detail);
    } catch (error) {
      console.error('Error loading winner detail:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do ganhador.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  // Effects
  useEffect(() => {
    loadCount(debouncedFilters);
    loadWinners(currentPage, pageSize, debouncedFilters);
  }, [debouncedFilters, currentPage, pageSize, loadCount, loadWinners]);

  // Handle drawer open
  const handleOpenDrawer = (winner: AdminWinnerMin) => {
    setSelectedWinner(winner);
    setDrawerOpen(true);
    loadWinnerDetail(winner.raffle_id);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Show all (reset to default)
  const handleShowAll = () => {
    setFilters(INITIAL_FILTERS);
    setPageSize(DEFAULT_PAGE_SIZE);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Render federal pairs as chips
  const renderFederalPairs = (pairs: string | null) => {
    if (!pairs) return '—';
    const pairArray = pairs.split('-');
    return (
      <div className="flex gap-1 flex-wrap">
        {pairArray.map((pair, index) => (
          <span 
            key={index} 
            className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-mono rounded"
          >
            {pair}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Ganhadores (Admin)</h1>
        <p className="text-muted-foreground">Loteria Federal · somente leitura</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por rifa, nome, email, telefone ou CPF"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="organizer">Organizador (ID)</Label>
              <Input
                id="organizer"
                placeholder="UUID do organizador"
                value={filters.organizerUserId}
                onChange={(e) => handleFilterChange('organizerUserId', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="raffle">Rifa (ID)</Label>
              <Input
                id="raffle"
                placeholder="UUID da rifa"
                value={filters.raffleId}
                onChange={(e) => handleFilterChange('raffleId', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="winner">Vencedor (ID)</Label>
              <Input
                id="winner"
                placeholder="UUID do vencedor"
                value={filters.winnerUserId}
                onChange={(e) => handleFilterChange('winnerUserId', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateFrom">Data (De)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Data (Até)</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
              <Button variant="outline" onClick={handleShowAll}>
                Ver todos
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {countLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Contando...
                </div>
              ) : (
                <span>{totalCount} resultados</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : winners.length === 0 ? (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sem ganhadores com os filtros atuais</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou limpar todos para ver mais resultados.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar filtros
                  </Button>
                  <Button variant="outline" onClick={handleShowAll}>
                    Ver todos
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Thumb</TableHead>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Status & Sorteio</TableHead>
                    <TableHead>Federal</TableHead>
                    <TableHead>Vencedor</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => (
                    <TableRow key={winner.winner_id}>
                      <TableCell>
                        <div className="w-14 h-14 rounded overflow-hidden bg-muted">
                          {winner.raffle_image_url ? (
                            <img 
                              src={winner.raffle_image_url} 
                              alt={winner.raffle_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <a 
                            href={`/ganhaveis/${winner.link_raffle_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                          >
                            {winner.raffle_title}
                          </a>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">{winner.raffle_status}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {formatBrazilianDate(winner.raffle_draw_date, true)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{winner.concurso_number || '—'}</div>
                          {renderFederalPairs(winner.federal_pairs)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">{winner.winner_handle_fallback}</div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {winner.buyer_name && (
                            <div className="font-medium">{winner.buyer_name}</div>
                          )}
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {winner.buyer_phone && <div>{winner.buyer_phone}</div>}
                            {winner.buyer_cpf && <div>{winner.buyer_cpf}</div>}
                            {winner.buyer_email && <div>{winner.buyer_email}</div>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDrawer(winner)}
                          >
                            Abrir
                          </Button>
                          
                          {winner.buyer_phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const url = getWhatsAppUrl(winner.buyer_phone);
                                if (url) window.open(url, '_blank');
                              }}
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              copyContactsToClipboard(winner);
                              toast({
                                title: "Copiado!",
                                description: "Contatos copiados para a área de transferência.",
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          {winner.link_ticket_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/admin/tickets/${winner.link_ticket_id}`, '_blank')}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && winners.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Itens por página:</Label>
                  <Select 
                    value={pageSize.toString()} 
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({totalCount} total)
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasNextPage}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {selectedWinner?.raffle_title}
            </SheetTitle>
            <SheetDescription>
              <Badge variant="secondary">premiado</Badge>
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="space-y-6 mt-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : selectedWinnerDetail ? (
            <div className="space-y-6 mt-6">
              {/* Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedWinnerDetail.raffle_image_url && (
                    <div className="w-full h-32 rounded overflow-hidden bg-muted">
                      <img 
                        src={selectedWinnerDetail.raffle_image_url} 
                        alt={selectedWinnerDetail.raffle_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Concurso:</div>
                      <div className="font-medium">{selectedWinnerDetail.concurso_number || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Data:</div>
                      <div className="font-medium">{formatBrazilianDate(selectedWinnerDetail.federal_draw_date)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Pares:</div>
                    {renderFederalPairs(selectedWinnerDetail.federal_pairs)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target → Ticket: </span>
                      <span className="font-mono">{selectedWinnerDetail.federal_target || '—'}</span>
                      <span className="mx-2">→</span>
                      <span className="font-mono">{selectedWinnerDetail.winning_ticket || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registrado: </span>
                      <span>{formatBrazilianDate(selectedWinnerDetail.winner_created_at, true)}</span>
                      <span className="text-muted-foreground ml-2">
                        ({formatRelativeTime(selectedWinnerDetail.winner_created_at)})
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Comprador (contato)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedWinnerDetail.buyer_name && (
                    <div>
                      <div className="text-muted-foreground text-sm">Nome:</div>
                      <div className="font-medium">{selectedWinnerDetail.buyer_name}</div>
                    </div>
                  )}

                  {selectedWinnerDetail.buyer_phone && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-muted-foreground text-sm">Telefone:</div>
                        <div className="font-medium">{selectedWinnerDetail.buyer_phone}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = getWhatsAppUrl(selectedWinnerDetail.buyer_phone);
                          if (url) window.open(url, '_blank');
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  )}

                  {selectedWinnerDetail.buyer_cpf && (
                    <div>
                      <div className="text-muted-foreground text-sm">CPF:</div>
                      <div className="font-medium">{selectedWinnerDetail.buyer_cpf}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-muted-foreground text-sm">Email:</div>
                    <div className="font-medium">{selectedWinnerDetail.buyer_email || '—'}</div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      copyContactsToClipboard(selectedWinnerDetail);
                      toast({
                        title: "Copiado!",
                        description: "Contatos copiados para a área de transferência.",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar contatos
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atalhos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`/ganhaveis/${selectedWinnerDetail.link_raffle_id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver rifa pública
                  </Button>
                  
                  {selectedWinnerDetail.link_ticket_id && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(`/admin/tickets/${selectedWinnerDetail.link_ticket_id}`, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver ticket
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`/admin/users/${selectedWinnerDetail.link_winner_user_id}`, '_blank')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Ver perfil do vencedor
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Não foi possível carregar os detalhes.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}