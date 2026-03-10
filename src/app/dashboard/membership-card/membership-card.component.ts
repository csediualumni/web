import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';

export interface MemberCardData {
  name: string;
  memberId: string;
  batch: number | null;
  email: string;
  jobTitle: string | null;
  company: string | null;
}

@Component({
  selector: 'app-membership-card',
  standalone: true,
  template: `
    <div class="flex flex-col items-stretch gap-3">
      <!-- Card canvas preview -->
      <div class="relative rounded-xl overflow-hidden shadow-2xl" style="aspect-ratio:1.586">
        <canvas #cardCanvas class="w-full h-full block" style="border-radius:12px"></canvas>
        <!-- shimmer when not yet drawn -->
        <div
          class="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 rounded-xl -z-10"
        ></div>
      </div>

      <!-- Download button -->
      <button
        (click)="download()"
        class="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
               bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold
               transition-colors shadow-sm"
      >
        <i class="fa-solid fa-download text-xs"></i>
        Download Membership Card
      </button>
    </div>
  `,
})
export class MembershipCardComponent implements AfterViewInit, OnChanges {
  @Input() data!: MemberCardData;
  @ViewChild('cardCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private drawn = false;

  ngAfterViewInit(): void {
    this.draw();
    this.drawn = true;
  }

  ngOnChanges(): void {
    if (this.drawn) this.draw();
  }

  download(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${this.data.memberId}-membership-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ─── Canvas drawing ───────────────────────────────────────────

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.data) return;

    const W = 1020;
    const H = 643; // ~credit-card ratio 1.586
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d')!;

    // ── 1. Background gradient ────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0c1445'); // deep navy
    bg.addColorStop(0.5, '#0f2057');
    bg.addColorStop(1, '#083344'); // dark teal
    ctx.fillStyle = bg;
    this.roundRect(ctx, 0, 0, W, H, 24);
    ctx.fill();

    // ── 2. Decorative circles (top-right) ─────────────────────
    this.drawDecorativeCircles(ctx, W, H);

    // ── 3. Left accent stripe ─────────────────────────────────
    const stripe = ctx.createLinearGradient(0, 0, 0, H);
    stripe.addColorStop(0, '#34d399'); // emerald-400
    stripe.addColorStop(0.5, '#059669');
    stripe.addColorStop(1, '#fbbf24'); // amber-400
    ctx.fillStyle = stripe;
    this.roundRect(ctx, 0, 0, 10, H, [24, 0, 0, 24]);
    ctx.fill();

    // ── 4. Top noise / subtle grid pattern ────────────────────
    this.drawSubtleGrid(ctx, W, H);

    // ── 5. Org logo + name (top-right) ───────────────────────
    this.drawOrgHeader(ctx, W);

    // ── 6. "LIFETIME MEMBER" badge (top-left, where chip was) ─
    this.drawBadge(ctx);

    // ── 7. Member name ────────────────────────────────────
    this.drawMemberName(ctx, H);

    // ── 8. Member ID box ───────────────────────────────
    this.drawMemberId(ctx, H);

    // ── 9. Meta line (batch · title · company) ──────────────
    this.drawMeta(ctx, H);

    // ── 10. Bottom bar ─────────────────────────────────
    this.drawBottomBar(ctx, W, H);

    // ── 11. Holographic shimmer strip ─────────────────────
    this.drawHoloStrip(ctx, W, H);
  }

  // ─── Sub-draw helpers ─────────────────────────────────────────

  private drawDecorativeCircles(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const circles = [
      { x: W + 60, y: -80, r: 300, alpha: 0.06 },
      { x: W - 80, y: H * 0.2, r: 200, alpha: 0.07 },
      { x: W - 180, y: H * 0.7, r: 160, alpha: 0.05 },
      { x: W * 0.6, y: H + 40, r: 240, alpha: 0.05 },
    ];
    for (const c of circles) {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      grad.addColorStop(0, `rgba(99,214,177,${c.alpha * 2})`);
      grad.addColorStop(1, 'rgba(99,214,177,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawSubtleGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.028)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawOrgHeader(ctx: CanvasRenderingContext2D, W: number) {
    // Right side of top: org name
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('CSE DIU ALUMNI NETWORK', W - 48, 76);

    ctx.fillStyle = 'rgba(99,214,177,0.85)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Department of Computer Science & Engineering', W - 48, 100);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Dhaka International University', W - 48, 120);
    ctx.restore();
  }

  private drawBadge(ctx: CanvasRenderingContext2D) {
    const badgeY = 90;
    const label = '✦  LIFETIME MEMBER  ✦';

    ctx.save();
    const bx = 48;
    const textGrad = ctx.createLinearGradient(bx, 0, bx + 300, 0);
    textGrad.addColorStop(0, '#34d399');
    textGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = textGrad;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.letterSpacing = '2px';
    ctx.fillText(label, bx, badgeY);
    ctx.letterSpacing = '0px';
    ctx.restore();
  }

  private drawMemberName(ctx: CanvasRenderingContext2D, H: number) {
    const name = (this.data.name || 'Alumni Member').toUpperCase();
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.textAlign = 'left';
    // Shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(name, 48, H * 0.6);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private drawMemberId(ctx: CanvasRenderingContext2D, H: number) {
    const id = this.data.memberId;
    const idY = H * 0.695;

    ctx.save();

    // ID label
    ctx.fillStyle = 'rgba(99,214,177,0.8)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MEMBER ID', 48, idY - 6);

    // ID value box
    ctx.font = 'bold 28px "Courier New", monospace';
    const tw = ctx.measureText(id).width;
    const boxPx = 20,
      boxPy = 10;
    const bx = 44,
      by = idY + 2;
    const bw = tw + boxPx * 2,
      bh = 28 + boxPy * 2;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.roundRect(ctx, bx, by, bw, bh, 8);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, bx, by, bw, bh, 8);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(id, bx + boxPx, by + boxPy + 24);

    ctx.restore();
  }

  private drawMeta(ctx: CanvasRenderingContext2D, H: number) {
    const metaY = H * 0.84;
    const parts: string[] = [];
    if (this.data.batch) parts.push(`Batch ${this.data.batch}`);
    if (this.data.jobTitle) parts.push(this.data.jobTitle);
    if (this.data.company) parts.push(this.data.company);
    const meta = parts.join('  ·  ');

    ctx.save();
    ctx.fillStyle = 'rgba(148,163,184,0.9)'; // slate-400
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(meta || this.data.email, 48, metaY);
    ctx.restore();
  }

  private drawBottomBar(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Thin separator line
    const lineY = H - 68;
    const lineGrad = ctx.createLinearGradient(20, lineY, W - 20, lineY);
    lineGrad.addColorStop(0, 'rgba(52,211,153,0.6)');
    lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
    lineGrad.addColorStop(1, 'rgba(251,191,36,0.4)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, lineY);
    ctx.lineTo(W - 20, lineY);
    ctx.stroke();

    // Bottom text
    const year = new Date().getFullYear();
    ctx.save();
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('csediualumni.com  ·  alumni@csediualumni.com', 48, H - 36);

    ctx.textAlign = 'right';
    ctx.fillText(`Issued ${year}  ·  Valid for Lifetime`, W - 48, H - 36);
    ctx.restore();
  }

  private drawHoloStrip(ctx: CanvasRenderingContext2D, W: number, H: number) {
    // Thin iridescent strip near bottom of card
    const stripY = H - 18;
    const stripH = 6;
    const holo = ctx.createLinearGradient(24, 0, W - 24, 0);
    holo.addColorStop(0, 'rgba(52,211,153,0.0)');
    holo.addColorStop(0.15, 'rgba(99,102,241,0.5)');
    holo.addColorStop(0.3, 'rgba(52,211,153,0.6)');
    holo.addColorStop(0.5, 'rgba(251,191,36,0.5)');
    holo.addColorStop(0.7, 'rgba(236,72,153,0.5)');
    holo.addColorStop(0.85, 'rgba(99,102,241,0.5)');
    holo.addColorStop(1, 'rgba(52,211,153,0.0)');
    ctx.fillStyle = holo;
    this.roundRect(ctx, 24, stripY, W - 48, stripH, stripH / 2);
    ctx.fill();
  }

  // ─── Utility ──────────────────────────────────────────────────

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii: number | number[],
  ) {
    const r =
      typeof radii === 'number'
        ? [radii, radii, radii, radii]
        : radii.length === 2
          ? [radii[0], radii[1], radii[0], radii[1]]
          : radii;
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + w - r[1], y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    ctx.lineTo(x + w, y + h - r[2]);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    ctx.lineTo(x + r[3], y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    ctx.lineTo(x, y + r[0]);
    ctx.quadraticCurveTo(x, y, x + r[0], y);
    ctx.closePath();
  }
}
