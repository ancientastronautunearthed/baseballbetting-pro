const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: '"The analytical depth is impressive. Their pitcher matchup analysis has completely changed how I approach MLB betting. Up 32% since joining."',
      author: 'Michael T.',
      since: 'Member since 2022',
      rating: 5
    },
    {
      id: 2,
      text: '"The daily insights on pitcher performance and team trends have been spot on. Their 78%+ confidence picks hit at an incredible rate."',
      author: 'Sarah K.',
      since: 'Member since 2023',
      rating: 5
    },
    {
      id: 3,
      text: '"The Elite plan is worth every penny. The advanced analytics dashboard gives me insights I couldn\'t find anywhere else. ROI has been excellent."',
      author: 'David R.',
      since: 'Member since 2021',
      rating: 4.5
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-primary mb-3">What Our Members Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Join thousands of members who are making smarter MLB wagers.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-neutral p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="text-secondary">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{testimonial.text}</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-bold text-primary">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.since}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
