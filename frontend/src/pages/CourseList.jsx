import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Pagination,
  Box,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import { courseAPI } from '../api/services';

const levels = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('All levels');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (level && level !== 'All levels') params.level = level;
      const { data } = await courseAPI.list(params);
      setCourses(data.courses);
      setPages(data.pages || 1);
    } catch {
      // silently fail, list stays empty
    } finally {
      setLoading(false);
    }
  }, [page, search, category, level]);

  useEffect(() => {
    courseAPI.categories().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchCourses, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchCourses]);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 38 }, mb: 1 }}>
          Browse courses
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Find the right course to build your next skill.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <TextField
            placeholder="Search courses…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Level"
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
            sx={{ minWidth: 180 }}
          >
            {levels.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Loader height="40vh" />
        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No courses match your search.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
            {pages > 1 && (
              <Stack alignItems="center" sx={{ mt: 5 }}>
                <Pagination count={pages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default CourseList;
