package org.ohdsi.heracles;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.ohdsi.heracles.HeraclesApp;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = HeraclesApp.class)
@WebAppConfiguration
public class HeraclesAppTests {

	@Test
	public void contextLoads() {
	}

}
