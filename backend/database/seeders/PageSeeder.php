<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        Page::updateOrCreate(['slug' => 'about-us'], [
            'title' => 'Our Fashion Story',
            'content' => '
                <div class="container py-5">
                    <div class="row align-items-center mb-5">
                        <div class="col-md-6">
                            <h2 class="fw-black display-5 mb-4">Redefining <span class="text-primary">Modern Style</span> Since 2026</h2>
                            <p class="lead text-muted fw-bold">Gemini Cloth Store isn\'t just a shop; it\'s a movement towards sustainable, high-impact fashion.</p>
                            <p class="text-muted mb-4">Founded in the heart of AI Valley, we merge technology with craftsmanship to deliver apparel that doesn\'t just look good—it feels like a second skin.</p>
                        </div>
                        <div class="col-md-6">
                            <img src="https://images.unsplash.com/photo-1534126416832-a88fdf2911c2?q=80&w=1000" class="img-fluid rounded-5 shadow-2xl" alt="About">
                        </div>
                    </div>
                    <div class="row g-4 mt-5">
                        <div class="col-md-4 text-center">
                            <div class="bg-primary bg-opacity-10 p-5 rounded-5 mb-4">
                                <i class="bi bi-gem fs-1 text-primary"></i>
                            </div>
                            <h4 class="fw-black">Premium Quality</h4>
                            <p class="text-muted px-3">We source the finest fabrics from global partners to ensure lasting durability.</p>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="bg-dark bg-opacity-10 p-5 rounded-5 mb-4">
                                <i class="bi bi-recycle fs-1 text-dark"></i>
                            </div>
                            <h4 class="fw-black">Eco-Friendly</h4>
                            <p class="text-muted px-3">Our production process is optimized to minimize waste and environmental impact.</p>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="bg-primary bg-opacity-10 p-5 rounded-5 mb-4">
                                <i class="bi bi-lightning-charge fs-1 text-primary"></i>
                            </div>
                            <h4 class="fw-black">Trend-Setting</h4>
                            <p class="text-muted px-3">Always ahead of the curve with designs that define the upcoming season.</p>
                        </div>
                    </div>
                </div>',
            'status' => true
        ]);

        Page::updateOrCreate(['slug' => 'contact-us'], [
            'title' => 'Get in Touch',
            'content' => '
                <div class="container py-5">
                    <div class="row g-5">
                        <div class="col-md-5">
                            <h2 class="fw-black mb-4">We\'d love to <span class="text-primary">hear from you</span></h2>
                            <p class="text-muted fw-bold mb-5">Have questions about an order or want to collaborate? Reach out to our dedicated support team.</p>
                            <div class="d-flex flex-column gap-4">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-primary text-white p-3 rounded-circle shadow-sm"><i class="bi bi-geo-alt-fill fs-4 px-1"></i></div>
                                    <div><h6 class="mb-0 fw-black">Global HQ</h6><p class="mb-0 small text-muted">123 Fashion Blvd, NY 10001</p></div>
                                </div>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-dark text-white p-3 rounded-circle shadow-sm"><i class="bi bi-envelope-at-fill fs-4 px-1"></i></div>
                                    <div><h6 class="mb-0 fw-black">Email Support</h6><p class="mb-0 small text-muted">support@geministore.com</p></div>
                                </div>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="bg-primary text-white p-3 rounded-circle shadow-sm"><i class="bi bi-telephone-outbound-fill fs-4 px-1"></i></div>
                                    <div><h6 class="mb-0 fw-black">Direct Call</h6><p class="mb-0 small text-muted">+1 234 567 890</p></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="card shadow-2xl border-0 rounded-5 p-5 bg-white">
                                <form action="#" id="contact-form">
                                    <div class="row g-4">
                                        <div class="col-md-6"><label class="form-label fw-bold small text-muted">FULL NAME</label><input type="text" class="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" placeholder="Alex Mercer" required></div>
                                        <div class="col-md-6"><label class="form-label fw-bold small text-muted">EMAIL</label><input type="email" class="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" placeholder="alex@email.com" required></div>
                                        <div class="col-md-12"><label class="form-label fw-bold small text-muted">SUBJECT</label><input type="text" class="form-control rounded-pill p-3 border-0 bg-light fw-bold shadow-none" placeholder="Order Issue / Collaboration" required></div>
                                        <div class="col-md-12"><label class="form-label fw-bold small text-muted">MESSAGE</label><textarea class="form-control rounded-4 p-3 border-0 bg-light fw-bold shadow-none" rows="5" placeholder="How can we help you?" required></textarea></div>
                                        <div class="col-md-12"><button type="submit" class="btn btn-primary btn-lg rounded-pill w-100 py-3 fw-black shadow-lg">SEND MESSAGE <i class="bi bi-send-fill ms-2"></i></button></div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>',
            'status' => true
        ]);
    }
}
