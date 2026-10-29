# Sample-clock aggregation outcome

84m completed once, with 28 pinned inputs and 76 compressed numeric records. The parent independently verified hashes, all 727 own and 8,014 support bounds, reconstructed both unions exactly, and checked four derived candidates with Fraction stage/circle/group separation. Minimum stage slack is 4.6966314 or 2.3483157 device pixels after the support padding assumptions.

This run uses state.firstTime, not j/60 as actual realTime. The clock has 250 states; states 245..249 have no active own. No new Contour frame was painted. The parent's first checker incorrectly assumed j/60, then passed against recorded state.firstTime without rerunning the producer.

Diagnostic detail mode took 6,354.7ms wall, 2,580.6ms summed steps, maximum step 70ms and heartbeat 74.4ms. Serialized proof peak was 1,583,519B. These include diagnostic copying/export and are not normal UI acceptance. The separately audited retained batch upper bound adds 280,228B; this post-run audit is not an owner runtime reservation. Native backing stores and heap are outside the serialized definition.

The next gate paints actual Renderer.frame at j/60 for j=0..249, using the newly derived recipe as a pinned test target and freshly checking each actual paint against source samplers. It does not use saved raw as a model or certificate. Continuous time, owner authority, product registration, and UI performance remain unqualified.
